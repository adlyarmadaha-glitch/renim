// Firebase Firestore — Staff Chat (replaces base44 StaffChat entity)
import {
  collection, addDoc, deleteDoc, doc,
  query, orderBy, onSnapshot, limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const COL = "staffChat";

export const chatService = {
  // ── Subscribe realtime ───────────────────────────────────────────────────
  subscribe(callback) {
    const q = query(collection(db, COL), orderBy("created_date", "asc"), limit(200));
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  // ── Send message ─────────────────────────────────────────────────────────
  async send({ sender_name, sender_role, text, sender_id }) {
    await addDoc(collection(db, COL), {
      sender_name,
      sender_role,
      sender_id: sender_id || "",
      text,
      created_date: new Date().toISOString(),
    });
  },

  // ── Delete message ───────────────────────────────────────────────────────
  async delete(id) {
    await deleteDoc(doc(db, COL, id));
  },
};