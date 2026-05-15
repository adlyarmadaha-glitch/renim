/**
 * Watch Party — Firestore realtime sync
 * Collection: watch_party_rooms
 * Sub: watch_party_messages
 *
 * Security: input sanitization, rate limiting, message length limits
 */
import {
  collection, addDoc, doc, getDoc, updateDoc, onSnapshot,
  serverTimestamp, query, orderBy, limit, setDoc, deleteDoc, getDocs,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Security Helpers ─────────────────────────────────────────────────────────
function sanitize(str, maxLen = 300) {
  if (typeof str !== "string") return "";
  return str.replace(/[<>"'`]/g, "").trim().slice(0, maxLen);
}

// Rate limiter: returns true if action is allowed
const rateLimits = {};
function checkRateLimit(key, maxActions, windowMs) {
  const now = Date.now();
  if (!rateLimits[key]) rateLimits[key] = [];
  rateLimits[key] = rateLimits[key].filter((t) => now - t < windowMs);
  if (rateLimits[key].length >= maxActions) return false;
  rateLimits[key].push(now);
  return true;
}

// Validate room ID (only alphanumeric uppercase, 6 chars)
function isValidRoomId(id) {
  return typeof id === "string" && /^[A-Z0-9]{6}$/.test(id);
}

function roomRef(roomId) { return doc(db, "watch_party_rooms", roomId); }
function msgCol(roomId) { return collection(db, "watch_party_rooms", roomId, "messages"); }
function memberCol(roomId) { return collection(db, "watch_party_rooms", roomId, "members"); }

// Generate 6-char room code
export function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const watchPartyService = {
  // Create a new room
  async createRoom({ episodeId, animeTitle, episodeTitle, poster, host, isPublic = true }) {
    if (!host?.id) throw new Error("User tidak valid");
    // Rate limit: max 5 rooms per minute
    if (!checkRateLimit(`create_${host.id}`, 5, 60000)) throw new Error("Terlalu banyak membuat room. Coba lagi nanti.");
    const roomId = generateRoomCode();
    await setDoc(roomRef(roomId), {
      roomId,
      episodeId: sanitize(episodeId, 100),
      animeTitle: sanitize(animeTitle, 100),
      episodeTitle: sanitize(episodeTitle, 100),
      poster: sanitize(poster, 500),
      hostId: host.id,
      hostName: sanitize(host.name, 40),
      playerUrl: null,
      isPublic,
      isPlaying: false,
      currentTime: 0,
      lastSyncAt: serverTimestamp(),
      syncedBy: host.id,
      created_date: serverTimestamp(),
      active: true,
      memberCount: 1,
      watchCount: 0, // gamification: total viewers ever
    });
    await setDoc(doc(memberCol(roomId), host.id), {
      userId: host.id,
      userName: sanitize(host.name, 40),
      userAvatar: host.avatar || "",
      userRole: host.role || "user",
      isHost: true,
      joinedAt: serverTimestamp(),
    });
    return roomId;
  },

  // Join an existing room
  async joinRoom(roomId, user) {
    if (!isValidRoomId(roomId)) throw new Error("Kode room tidak valid");
    if (!user?.id) throw new Error("User tidak valid");
    // Rate limit: max 10 joins per minute
    if (!checkRateLimit(`join_${user.id}`, 10, 60000)) throw new Error("Terlalu banyak percobaan. Coba lagi nanti.");
    const snap = await getDoc(roomRef(roomId));
    if (!snap.exists()) throw new Error("Room tidak ditemukan");
    const room = { id: snap.id, ...snap.data() };
    if (!room.active) throw new Error("Room sudah tidak aktif");
    await setDoc(doc(memberCol(roomId), user.id), {
      userId: user.id,
      userName: sanitize(user.name, 40),
      userAvatar: user.avatar || "",
      userRole: user.role || "user",
      isHost: room.hostId === user.id,
      joinedAt: serverTimestamp(),
    });
    // Update member count
    await updateDoc(roomRef(roomId), { memberCount: (room.memberCount || 0) + 1, watchCount: (room.watchCount || 0) + 1 });
    return room;
  },

  // Leave room
  async leaveRoom(roomId, userId) {
    if (!isValidRoomId(roomId) || !userId) return;