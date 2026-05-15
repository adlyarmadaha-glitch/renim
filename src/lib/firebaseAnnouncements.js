// Firebase Firestore — Announcements (replaces announcementStorage localStorage)
import {
  collection, addDoc, deleteDoc, doc,
  query, orderBy, onSnapshot, limit, getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const COL = "announcements";

export const announcementService = {
  // ── Subscribe realtime ───────────────────────────────────────────────────
  subscribe(callback) {
    const q = query(collection(db, COL), orderBy("created_date", "desc"), limit(20));
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  // ── Get once ─────────────────────────────────────────────────────────────
  async list() {
    const snap = await getDocs(query(collection(db, COL), orderBy("created_date", "desc"), limit(20)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // ── Add ──────────────────────────────────────────────────────────────────
  async add({ text, type = "info", authorName, authorRole, authorId }) {
    return await addDoc(collection(db, COL), {
      text,
      type,
      authorName,
      authorRole,
      authorId,
      created_date: new Date().toISOString(),
    });
  },

  // ── Delete ───────────────────────────────────────────────────────────────
  async delete(id) {
    await deleteDoc(doc(db, COL, id));
  },
};