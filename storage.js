// ═══════════════════════════════════════════
//  STORAGE — LocalStorage wrapper
// ═══════════════════════════════════════════

const KEY_RECORDS      = 'cryptveil_records';
const KEY_ACHIEVEMENTS = 'cryptveil_achievements';
const KEY_SETTINGS     = 'cryptveil_settings';

export class Storage {
  saveRecord(run) {
    const records = this.getRecords();
    records.push(run);
    records.sort((a, b) => b.floor - a.floor || b.gold - a.gold);
    localStorage.setItem(KEY_RECORDS, JSON.stringify(records.slice(0, 10)));
  }

  getRecords() {
    try { return JSON.parse(localStorage.getItem(KEY_RECORDS)) ?? []; }
    catch { return []; }
  }

  saveAchievements(data) {
    localStorage.setItem(KEY_ACHIEVEMENTS, JSON.stringify(data));
  }

  getAchievements() {
    try { return JSON.parse(localStorage.getItem(KEY_ACHIEVEMENTS)) ?? {}; }
    catch { return {}; }
  }

  getSettings() {
    try { return JSON.parse(localStorage.getItem(KEY_SETTINGS)) ?? {}; }
    catch { return {}; }
  }

  saveSetting(key, val) {
    const s = this.getSettings();
    s[key] = val;
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(s));
  }
}
