// ═══════════════════════════════════════════
//  SCREEN MANAGER
// ═══════════════════════════════════════════

export class ScreenManager {

  show(name) {
    // Deactivate all base (non-overlay) screens
    document.querySelectorAll('.screen:not(.overlay)').forEach(el => {
      el.classList.remove('active');
    });
    const target = document.getElementById(`screen-${name}`);
    if (target) target.classList.add('active');
  }

  showOverlay(name) {
    const el = document.getElementById(`screen-${name}`);
    if (el) el.classList.remove('hidden');
  }

  closeOverlay(name) {
    const el = document.getElementById(`screen-${name}`);
    if (el) el.classList.add('hidden');
  }

  showGameOver(run) {
    // Make sure game screen is still the base (so overlay sits on it)
    this.show('game');

    const sub   = document.getElementById('go-sub-text');
    const stats = document.getElementById('go-stats');
    if (sub)   sub.textContent   = `Fallen on Floor ${run.floor} after ${this._formatTime(run.time)}.`;
    if (stats) stats.innerHTML   = this._statsHTML(run);
    this.showOverlay('gameover');
  }

  showWin(run) {
    this.show('game');
    const stats = document.getElementById('win-stats');
    if (stats) stats.innerHTML = this._statsHTML(run);
    this.showOverlay('win');
  }

  showRecords(records) {
    const list = document.getElementById('records-list');
    if (!list) return;
    if (!records.length) {
      list.innerHTML = '<p class="no-records">No runs recorded yet. Begin your descent.</p>';
    } else {
      list.innerHTML = records.slice(0, 5).map((r, i) => `
        <div class="record-entry">
          <div class="record-rank ${i === 0 ? 'gold' : ''}">#${i+1}</div>
          <div class="record-meta">Floor ${r.floor} — ${r.date}</div>
          <div class="record-stats-mini">
            <span>⚔ ${r.kills} kills</span>
            <span>◈ ${r.gold} gold</span>
            <span>⏱ ${this._formatTime(r.time)}</span>
          </div>
        </div>
      `).join('');
    }
    this.showOverlay('records');
  }

  showAchievements(all) {
    const list = document.getElementById('achievements-list');
    if (!list) return;
    list.innerHTML = all.map(a => `
      <div class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
      </div>
    `).join('');
    this.showOverlay('achievements');
  }

  showInventory(player) {
    const stats = document.getElementById('inv-stats');
    if (stats) stats.innerHTML = `
      <div class="inv-stat-chip"><div class="label">HP</div><div class="value">${player.hp}/${player.maxHp}</div></div>
      <div class="inv-stat-chip"><div class="label">ATK</div><div class="value">${player.atk}</div></div>
      <div class="inv-stat-chip"><div class="label">DEF</div><div class="value">${player.def}</div></div>
      <div class="inv-stat-chip"><div class="label">Gold</div><div class="value">${player.gold}</div></div>
      <div class="inv-stat-chip"><div class="label">Kills</div><div class="value">${player.kills}</div></div>
      <div class="inv-stat-chip"><div class="label">Level</div><div class="value">${player.level}</div></div>
    `;

    const grid = document.getElementById('inv-grid');
    if (grid) {
      const slots = Array.from({ length: 16 }, (_, i) => player.inventory[i] || null);
      grid.innerHTML = slots.map((item, i) => item
        ? `<div class="inv-slot" data-rarity="${item.rarity}" data-index="${i}">
             <div class="inv-slot-icon">${item.icon}</div>
             <div class="inv-slot-name">${item.name}</div>
           </div>`
        : `<div class="inv-slot empty"></div>`
      ).join('');

      grid.querySelectorAll('.inv-slot:not(.empty)').forEach(slot => {
        slot.addEventListener('click', () => {
          grid.querySelectorAll('.inv-slot').forEach(s => s.classList.remove('selected'));
          slot.classList.add('selected');
          const item = player.inventory[+slot.dataset.index];
          this._showItemDetail(item, player);
        });
      });
    }

    this.showOverlay('inventory');
  }

  _showItemDetail(item, player) {
    const detail = document.getElementById('inv-detail');
    if (!detail || !item) return;
    const statLabel = { atk: 'Damage', def: 'Defense', hp: 'Heal', gold: 'Gold' }[item.stat] ?? item.stat;
    detail.innerHTML = `
      <div class="detail-icon">${item.icon}</div>
      <div class="detail-name">${item.name}</div>
      <div class="detail-rarity ${item.rarity}">${item.rarity.toUpperCase()}</div>
      <div class="detail-stats">
        <div class="detail-stat"><span>${statLabel}</span><span class="ds-val">+${item.statValue}</span></div>
        <div class="detail-stat"><span>Type</span><span class="ds-val">${item.type}</span></div>
      </div>
      <button class="btn-use-item" id="btn-use">
        ${item.type === 'potion' ? 'Use Potion' : 'Equip'}
      </button>
    `;
    document.getElementById('btn-use')?.addEventListener('click', () => {
      if (item.type === 'potion') {
        player.heal(item.statValue);
      } else {
        player.equipItem(item);
      }
      this.showInventory(player);
    });
  }

  _statsHTML(run) {
    return `
      <div class="stat-row"><div class="s-label">Floor Reached</div><div class="s-val">${run.floor}</div></div>
      <div class="stat-row"><div class="s-label">Enemies Slain</div><div class="s-val">${run.kills}</div></div>
      <div class="stat-row"><div class="s-label">Gold Collected</div><div class="s-val">${run.gold}</div></div>
      <div class="stat-row"><div class="s-label">Time</div><div class="s-val">${this._formatTime(run.time)}</div></div>
    `;
  }

  _formatTime(s) {
    const m   = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }
}
