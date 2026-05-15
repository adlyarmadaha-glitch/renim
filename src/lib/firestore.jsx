/**
 * Firestore helper — drop-in replacement for db.entities.*
 * Usage:
 *   import { fsDb } from "@/lib/firestore";
 *   fsDb.Comment.list(animeId)
 *   fsDb.Comment.add({ ... })
 *   fsDb.Comment.remove(id)
 *   fsDb.Comment.subscribe(animeId, callback)
 */

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  updateDoc,
  getDoc,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Generic helpers ──────────────────────────────────────────────────────────

function col(name) {
  return collection(db, name);
}

async function listWhere(colName, field, value, order = "created_date", lim = 100) {
  const q = query(
    col(colName),
    where(field, "==", value),
    orderBy(order, "asc"),
    limit(lim)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function subscribeWhere(colName, field, value, order = "created_date", callback) {
  const q = query(
    col(colName),
    where(field, "==", value),
    orderBy(order, "asc")
  );
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
}

function subscribeAll(colName, order = "created_date", callback) {
  const q = query(col(colName), orderBy(order, "asc"));
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
}

async function addItem(colName, data) {
  const ref = await addDoc(col(colName), {
    ...data,
    created_date: serverTimestamp(),
  });
  return { id: ref.id, ...data };
}

async function removeItem(colName, id) {
  await deleteDoc(doc(db, colName, id));
}

async function updateItem(colName, id, data) {
  await updateDoc(doc(db, colName, id), { ...data, updated_date: serverTimestamp() });
}

async function getItem(colName, id) {
  const snap = await getDoc(doc(db, colName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ── Collections ──────────────────────────────────────────────────────────────

export const fsDb = {

  // ── Comment ─────────────────────────────────────────────────────────────
  Comment: {
    list: (animeId) => listWhere("comments", "anime_id", animeId, "created_date", 200),
    add: (data) => addItem("comments", data),
    remove: (id) => removeItem("comments", id),
    subscribe: (animeId, cb) => subscribeWhere("comments", "anime_id", animeId, "created_date", cb),
  },

  // ── CommentReply ─────────────────────────────────────────────────────────
  CommentReply: {
    list: (commentId) => listWhere("comment_replies", "comment_id", commentId, "created_date", 100),
    add: (data) => addItem("comment_replies", data),
    remove: (id) => removeItem("comment_replies", id),
    subscribe: (commentId, cb) => subscribeWhere("comment_replies", "comment_id", commentId, "created_date", cb),
  },

  // ── SupportTicket ─────────────────────────────────────────────────────────
  SupportTicket: {