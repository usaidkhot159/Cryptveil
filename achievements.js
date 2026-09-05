// ═══════════════════════════════════════════
//  ACHIEVEMENTS
// ═══════════════════════════════════════════

const DEFINITIONS = [
  { id: 'first_blood',      icon: '🗡️', name: 'First Blood',      desc: 'Defeat your first enemy.' },
  { id: 'treasure_hunter',  icon: '💎', name: 'Treasure Hunter',  desc: 'Accumulate 1000 gold in a single run.' },
  { id: 'survivor',         icon: '🛡️', name: 'Survivor',         desc: 'Reach floor 5 of the dungeon.' },
  { id: 'boss_slayer',      icon: '👑', name: 'Boss Slayer',       desc: 'Defeat the Dungeon Lord and escape.' },
  { id: 'no_damage',        icon: '✨', name: 'Untouchable',       desc: 'Clear a room without taking damage.' },
  { id: 'first_death',      icon: '☠️', name: 'The First Fall',    desc: 'Fall in battle for the first time.' },
  { id: 'hoarder',          icon: '🎒', name: 'Hoarder',           desc: 'Fill all 16 inventory slots.' },
  { id: 'legendary_find',   icon: '🟠', name: 'Fated Hand',        desc: 'Find a Legendary item.' },
];

export class Achievements {
  constructor(storage) {
    this.storage  = storage;
    this.unlocked = storage.getAchievements();
    this.toast    = document.getElementById('achievement-toast');
  }

  check(id) {
    if (this.unlocked[id]) return;
    const def = DEFINITIONS.find(d => d.id === id);
    if (!def) return;

    this.unlocked[id] = true;
    this.storage.saveAchievements(this.unlocked);
    this._showToast(def);
  }

  getAll() {
    return DEFINITIONS.map(d => ({ ...d, unlocked: !!this.unlocked[d.id] }));
  }

  _showToast(def) {
    if (!this.toast) return;
    this.toast.innerHTML = `
      <div class="toast-icon">${def.icon}</div>
      <div class="toast-body">
        <div class="toast-label">Achievement Unlocked</div>
        <div class="toast-name">${def.name}</div>
        <div class="toast-desc">${def.desc}</div>
      </div>
    `;
    this.toast.classList.remove('hidden', 'hiding');

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toast.classList.add('hiding');
      setTimeout(() => this.toast.classList.add('hidden'), 350);
    }, 3500);
  }
}
