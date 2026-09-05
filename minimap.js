// ═══════════════════════════════════════════
//  MINIMAP RENDERER
// ═══════════════════════════════════════════

import { TILES } from './constants.js';

export class MinimapRenderer {
  constructor(ctx, canvas, map, player) {
    this.ctx    = ctx;
    this.canvas = canvas;
    this.map    = map;
    this.player = player;

    this.scale  = canvas.width / map.w;
  }

  draw() {
    const ctx   = this.ctx;
    const map   = this.map;
    const W     = this.canvas.width;
    const H     = this.canvas.height;
    const s     = this.scale;

    ctx.clearRect(0, 0, W, H);

    for (let ty = 0; ty < map.h; ty++) {
      for (let tx = 0; tx < map.w; tx++) {
        if (!map.revealed[ty * map.w + tx]) continue;
        const tile = map.tileAt(tx, ty);
        switch (tile) {
          case TILES.FLOOR:
            ctx.fillStyle = '#252540';
            break;
          case TILES.WALL:
            ctx.fillStyle = '#0e0e1a';
            break;
          case TILES.STAIRS:
            ctx.fillStyle = '#2ab832';
            break;
          default: continue;
        }
        ctx.fillRect(Math.floor(tx * s), Math.floor(ty * s), Math.ceil(s), Math.ceil(s));
      }
    }

    // Player dot
    const px = this.player.tileX * s;
    const py = this.player.tileY * s;
    ctx.fillStyle = '#e8c56a';
    ctx.beginPath();
    ctx.arc(px + s/2, py + s/2, Math.max(2, s * 1.5), 0, Math.PI * 2);
    ctx.fill();
  }
}
