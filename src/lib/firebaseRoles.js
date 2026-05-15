// Firebase Firestore — Custom Roles (replaces localStorage customRoles)
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, getDocs, setDoc, getDoc, updateDoc, query, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const ROLES_COL = "customRoles";
const ASSIGNMENTS_DOC = "config/roleAssignments";

export const roleService = {
  // ── Subscribe roles realtime ─────────────────────────────────────────────
  subscribeRoles(callback) {
    return onSnapshot(collection(db, ROLES_COL), snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  // ── Subscribe assignments realtime ───────────────────────────────────────
  subscribeAssignments(callback) {
    return onSnapshot(doc(db, "config", "roleAssignments"), snap => {
      callback(snap.exists() ? (snap.data() || {}) : {});
    });
  },

  // ── Get roles once ───────────────────────────────────────────────────────
  async getRoles() {
    const snap = await getDocs(collection(db, ROLES_COL));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // ── Get assignments once ─────────────────────────────────────────────────
  async getAssignments() {
    const snap = await getDoc(doc(db, "config", "roleAssignments"));
    return snap.exists() ? (snap.data() || {}) : {};
  },

  // ── Create role ──────────────────────────────────────────────────────────
  async createRole({ label, color, emoji, effect }) {
    const ref = await addDoc(collection(db, ROLES_COL), {
      label,
      color: color || "#a855f7",
      emoji: emoji || "🎖️",
      effect: effect || "none",
    });
    return { id: ref.id, label, color, emoji, effect };
  },

  // ── Delete role ──────────────────────────────────────────────────────────
  async deleteRole(roleId) {
    await deleteDoc(doc(db, ROLES_COL, roleId));
    // Remove assignments using this role
    const assignments = await this.getAssignments();
    const updated = { ...assignments };
    Object.keys(updated).forEach(email => {
      if (updated[email] === roleId) delete updated[email];
    });
    await setDoc(doc(db, "config", "roleAssignments"), updated);
  },

  // ── Assign role to user ──────────────────────────────────────────────────
  async assignRole(email, roleId) {
    const assignments = await this.getAssignments();
    if (roleId) {
      assignments[email.toLowerCase()] = roleId;
    } else {
      delete assignments[email.toLowerCase()];
    }
    await setDoc(doc(db, "config", "roleAssignments"), assignments);
  },

  // ── Get user role by email ───────────────────────────────────────────────
  async getUserRole(email) {
    if (!email) return null;
    const assignments = await this.getAssignments();
    const roleId = assignments[email.toLowerCase()];
    if (!roleId) return null;
    const snap = await getDoc(doc(db, ROLES_COL, roleId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
};