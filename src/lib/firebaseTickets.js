// Firebase Firestore — Support Tickets & Messages
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, onSnapshot, getDocs, serverTimestamp, getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const TICKETS = "tickets";
const MESSAGES = "ticketMessages";

export const ticketService = {
  // ── Create ticket ────────────────────────────────────────────────────────
  async create(data) {
    return await addDoc(collection(db, TICKETS), {
      ...data,
      status: "open",
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    });
  },

  // ── Update ticket ────────────────────────────────────────────────────────
  async update(id, data) {
    await updateDoc(doc(db, TICKETS, id), {
      ...data,
      updated_date: new Date().toISOString(),
    });
  },

  // ── Delete ticket + all messages ─────────────────────────────────────────
  async delete(id) {
    // Delete messages first
    const msgs = await getDocs(query(collection(db, MESSAGES), where("ticket_id", "==", id)));
    await Promise.all(msgs.docs.map(d => deleteDoc(d.ref)));
    await deleteDoc(doc(db, TICKETS, id));
  },

  // ── Get user tickets (realtime) ──────────────────────────────────────────
  subscribeUserTickets(userId, callback) {
    const q = query(
      collection(db, TICKETS),
      where("user_id_local", "==", userId),
      orderBy("created_date", "desc")
    );
    return onSnapshot(q, snap => {
      const tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(t => t.status !== "closed"); // hide closed
      callback(tickets);
    });
  },

  // ── Get all tickets (realtime, for staff/admin) ──────────────────────────
  subscribeAllTickets(callback) {
    const q = query(collection(db, TICKETS), orderBy("created_date", "desc"));
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  // ── Get ticket messages (realtime) ───────────────────────────────────────
  subscribeMessages(ticketId, callback) {
    const q = query(
      collection(db, MESSAGES),
      where("ticket_id", "==", ticketId),
      orderBy("created_date", "asc")
    );
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  // ── Send message ─────────────────────────────────────────────────────────
  async sendMessage(data) {
    await addDoc(collection(db, MESSAGES), {
      ...data,
      created_date: new Date().toISOString(),
    });
    // Auto-update ticket status
    const ticketRef = doc(db, TICKETS, data.ticket_id);
    const ticketSnap = await getDoc(ticketRef);
    if (ticketSnap.exists()) {
      const ticket = ticketSnap.data();
      const isStaff = data.sender_role === "admin" || data.sender_role === "staff";
      // Auto status: if staff replies and ticket is "open", move to "in_progress"
      if (isStaff && ticket.status === "open") {
        await updateDoc(ticketRef, {
          status: "in_progress",
          admin_reply: data.text,
          admin_name: data.sender_name,
          updated_date: new Date().toISOString(),
        });
      } else if (isStaff) {
        await updateDoc(ticketRef, {
          admin_reply: data.text,
          admin_name: data.sender_name,
          updated_date: new Date().toISOString(),
        });
      }
    }
  },

  // ── Fetch all tickets once (for admin panel tab) ─────────────────────────
  async getAll() {
    const snap = await getDocs(query(collection(db, TICKETS), orderBy("created_date", "desc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
};