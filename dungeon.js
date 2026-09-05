// ═══════════════════════════════════════════
//  DUNGEON GENERATOR — BSP Room-based
// ═══════════════════════════════════════════

import { TILES, TILE } from './constants.js';

export class DungeonGenerator {
  constructor(w, h, floor = 1) {
    this.w     = w;
    this.h     = h;
    this.floor = floor;
    this.rng   = new RNG(Date.now() ^ (floor * 9137));
  }

  generate() {
    const map = {
      w: this.w, h: this.h,
      tiles: new Uint8Array(this.w * this.h),
      rooms: [],
      startRoom: null,
      bossRoom:  null,
      revealed:  new Uint8Array(this.w * this.h),
      trapTiles: new Set(),
      exitTile:  null,

      tileAt: (x, y) => map.tiles[y * map.w + x] ?? TILES.VOID,
      isWalkable: (x, y) => {
        const t = map.tileAt(x, y);
        return t === TILES.FLOOR || t === TILES.DOOR || t === TILES.STAIRS;
      },
      reveal: (cx, cy, r) => {
        for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++) {
            const x = cx + dx, y = cy + dy;
            if (x >= 0 && x < map.w && y >= 0 && y < map.h)
              if (dx*dx + dy*dy <= r*r)
                map.revealed[y * map.w + x] = 1;
          }
      },
      isExit: (x, y) => map.exitTile && map.exitTile.x === x && map.exitTile.y === y,
    };

    // Fill with walls
    map.tiles.fill(TILES.WALL);

    // Build rooms via BSP
    const numRooms  = 8 + this.floor * 2;
    const minSize   = 5;
    const maxSize   = 12;
    const rooms     = [];

    const attempts = numRooms * 8;
    for (let i = 0; i < attempts && rooms.length < numRooms; i++) {
      const rw = this.rng.int(minSize, maxSize);
      const rh = this.rng.int(minSize, maxSize);
      const rx = this.rng.int(1, this.w - rw - 1);
      const ry = this.rng.int(1, this.h - rh - 1);
      const room = { x: rx, y: ry, w: rw, h: rh, cx: rx + (rw>>1), cy: ry + (rh>>1) };

      if (!rooms.some(r => this._overlaps(room, r, 2))) {
        rooms.push(room);
        this._carveRoom(map, room);
      }
    }

    // Connect rooms
    for (let i = 1; i < rooms.length; i++) {
      this._carveCorridor(map, rooms[i-1], rooms[i]);
    }

    // Place traps (random floor tiles)
    const numTraps = 3 + this.floor;
    for (let i = 0; i < numTraps; i++) {
      const room = rooms[this.rng.int(1, rooms.length - 1)];
      const tx = room.x + this.rng.int(1, room.w - 1);
      const ty = room.y + this.rng.int(1, room.h - 1);
      map.trapTiles.add(`${tx},${ty}`);
    }

    // Mark start, boss, exit
    map.startRoom = rooms[0];
    map.bossRoom  = rooms[rooms.length - 1];
    map.rooms     = rooms;

    // Exit stairs in boss room
    const exitX = map.bossRoom.cx;
    const exitY = map.bossRoom.cy;
    map.tiles[exitY * map.w + exitX] = TILES.STAIRS;
    map.exitTile = { x: exitX, y: exitY };

    return map;
  }

  _overlaps(a, b, pad = 0) {
    return !(a.x + a.w + pad < b.x || b.x + b.w + pad < a.x ||
             a.y + a.h + pad < b.y || b.y + b.h + pad < a.y);
  }

  _carveRoom(map, room) {
    for (let y = room.y; y < room.y + room.h; y++)
      for (let x = room.x; x < room.x + room.w; x++)
        map.tiles[y * map.w + x] = TILES.FLOOR;
  }

  _carveCorridor(map, a, b) {
    let x = a.cx, y = a.cy;
    // L-shaped corridor
    if (this.rng.float() < 0.5) {
      while (x !== b.cx) { map.tiles[y * map.w + x] = TILES.FLOOR; x += x < b.cx ? 1 : -1; }
      while (y !== b.cy) { map.tiles[y * map.w + x] = TILES.FLOOR; y += y < b.cy ? 1 : -1; }
    } else {
      while (y !== b.cy) { map.tiles[y * map.w + x] = TILES.FLOOR; y += y < b.cy ? 1 : -1; }
      while (x !== b.cx) { map.tiles[y * map.w + x] = TILES.FLOOR; x += x < b.cx ? 1 : -1; }
    }
  }
}

class RNG {
  constructor(seed) { this.s = seed | 0; }
  next()    { this.s = ((this.s * 1664525 + 1013904223) | 0) >>> 0; return this.s; }
  float()   { return this.next() / 0xFFFFFFFF; }
  int(a, b) { return a + (this.next() % (b - a + 1)); }
}
