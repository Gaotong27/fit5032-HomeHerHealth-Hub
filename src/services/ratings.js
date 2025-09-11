const LS_KEY = 'hhh_ratings';

function _load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function _save(db) { localStorage.setItem(LS_KEY, JSON.stringify(db)) }

function _getSessionUser() {
  try { return JSON.parse(localStorage.getItem('hhh_user') || 'null') } catch { return null }
}
function _getSessionRaw() {
  try { return JSON.parse(localStorage.getItem('hhh.session') || 'null') } catch { return null }
}
function _userKeyOf(u) {
  return u?.email ? String(u.email).trim().toLowerCase() : null
}

export const ratings = {
  getUserKey(u) { return _userKeyOf(u) },

  getSummary(eventId) {
    const db = _load()[eventId] || {};
    const values = Object.values(db).map(r => Number(r.value)).filter(v => v >= 1 && v <= 5);
    const count = values.length;
    const total = values.reduce((a, b) => a + b, 0);
    const avg = count ? +(total / count).toFixed(2) : 0;
    const dist = [1,2,3,4,5].map(s => values.filter(v => v === s).length);
    return { avg, count, dist };
  },

  getUserRating(eventId, userKey) {
    const rec = _load()[eventId]?.[userKey];
    return rec ? Number(rec.value) : 0;
  },

  /** Only logged-in non-admin users are allowed to write */
  set(eventId, userKey, value) {
    const sess = _getSessionRaw();
    const u = _getSessionUser();
    const meKey = _userKeyOf(u);

    if (!sess || !u?.email || !meKey || meKey !== userKey) {
      const err = new Error('Not authenticated'); err.code = 403; throw err;
    }
    if (u.role === 'admin') {
      const err = new Error('Admins cannot rate'); err.code = 403; throw err;
    }
    const v = Number(value);
    if (!Number.isFinite(v) || v < 1 || v > 5) {
      const err = new Error('Invalid rating value'); err.code = 400; throw err;
    }

    const db = _load();
    if (!db[eventId]) db[eventId] = {};
    db[eventId][userKey] = { value: v, updatedAt: new Date().toISOString() };
    _save(db);
    return this.getSummary(eventId);
  },

  clearEvent(eventId) {
    const db = _load();
    if (db[eventId]) { delete db[eventId]; _save(db); }
    return this.getSummary(eventId);
  },

  list(eventId) {
    const recs = _load()[eventId] || {};
    return Object.entries(recs).map(([userKey, rec]) => ({
      userKey, value: Number(rec.value), updatedAt: rec.updatedAt
    }));
  },
};
