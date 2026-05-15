// Auth system — re-exports firebaseAuth as authStorage for backward compatibility
import { firebaseAuth } from "@/lib/firebaseAuth";
export { USER_TITLES } from "@/lib/firebaseAuth";

// Wrap firebaseAuth to add sync getUser via getUserSync,
// and keep async getUser for places that await it.
export const authStorage = {
  // Sync — reads from in-memory cache or localStorage cache (may be null on first load)
  getUser() {
    return firebaseAuth.getUserSync();
  },

  // Async — fetches from Firestore (use when fresh data is needed)
  getUserAsync() {
    return firebaseAuth.getUser();
  },

  updateProfile(data) {
    return firebaseAuth.updateProfile(data);
  },

  logout() {
    return firebaseAuth.logout();
  },

  deleteAccount() {
    return firebaseAuth.deleteAccount();
  },

  login(data) {
    return firebaseAuth.login(data);
  },

  register(data) {
    return firebaseAuth.register(data);
  },

  getUserSync() {
    return firebaseAuth.getUserSync();
  },
};