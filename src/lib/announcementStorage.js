const KEY = "renime_announcements";

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const announcementStorage = {
  list() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  },
  add({ text, type = "info", authorName, authorRole, authorId }) {
    const list = this.list();
    const record = { id: genId(), text, type, authorName, authorRole, authorId, created_date: new Date().toISOString() };
    list.unshift(record);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
    window.dispatchEvent(new Event("renime-announcement-change"));
    return record;
  },
  delete(id) {
    const list = this.list().filter((a) => a.id !== id);
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("renime-announcement-change"));
  },
};