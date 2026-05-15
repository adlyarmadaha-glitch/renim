// Firebase-backed auth system — replaces localStorage auth
// Users stored in Firestore "users" collection
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection,
  query, where, getDocs, serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { rollRas, rpgStorage } from "@/lib/rpgSystem";

const AUTH_SESSION_KEY = "renime_auth_session"; // only stores uid locally

function genId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function hashPass(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash.toString(16);
}

export const USER_TITLES = {
  user:  { label: "Wibu",  color: "text-primary",  bg: "bg-primary/15" },
  admin: { label: "Dewa",  color: "text-red-400",   bg: "bg-red-500/15" },
  staff: { label: "Staf",  color: "text-cyan-400",  bg: "bg-cyan-500/15" },
};

// ── Session (local only — just caches uid) ───────────────────────────────────
function getSessionUid() {
  try { return localStorage.getItem(AUTH_SESSION_KEY) || null; } catch { return null; }
}
function setSessionUid(uid) {
  try { localStorage.setItem(AUTH_SESSION_KEY, uid); } catch {}
}
function clearSession() {
  try { localStorage.removeItem(AUTH_SESSION_KEY); } catch {}
}

// ── In-memory user cache ─────────────────────────────────────────────────────
let _cachedUser = null;

function toSession(data) {
  return {
    id: data.id,
    name: data.name || "",
    username: data.username || "",
    email: data.email || "",
    avatar: data.avatar || null,
    role: data.role || "user",
    createdAt: data.createdAt || "",
  };
}

export const firebaseAuth = {
  // ── Get current user (from cache or Firestore) ───────────────────────────
  async getUser() {
    if (_cachedUser) return toSession(_cachedUser);
    const uid = getSessionUid();
    if (!uid) return null;
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) { clearSession(); return null; }
      _cachedUser = { id: snap.id, ...snap.data() };
      return toSession(_cachedUser);
    } catch { return null; }
  },

  // ── Sync user (used by hooks) ────────────────────────────────────────────
  getUserSync() {
    if (_cachedUser) return toSession(_cachedUser);
    // Try to get from localStorage cache
    try {
      const raw = localStorage.getItem("renime_user_cache");
      if (raw) {
        _cachedUser = JSON.parse(raw);
        return toSession(_cachedUser);
      }
    } catch {}
    return null;
  },

  // ── Register ─────────────────────────────────────────────────────────────
  async register({ name, username, email, password }) {
    // Check email uniqueness
    const emailQ = query(collection(db, "users"), where("email", "==", email.toLowerCase().trim()));
    const emailSnap = await getDocs(emailQ);
    if (!emailSnap.empty) throw new Error("Email sudah terdaftar");

    // Check username uniqueness
    if (username) {
      const uQ = query(collection(db, "users"), where("username", "==", username.toLowerCase().trim()));
      const uSnap = await getDocs(uQ);
      if (!uSnap.empty) throw new Error("Username sudah dipakai");
    }

    // Determine role
    const role = await this._resolveRole(email);

    const id = genId();
    const ras = rollRas();
    const userData = {
      id,
      name: name.trim(),
      username: (username || name).trim().toLowerCase().replace(/\s+/g, "_"),
      email: email.toLowerCase().trim(),