// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════

export const TILE = 32; // pixels per tile

export const CONFIG = {
  MAP_W:      64,
  MAP_H:      64,
  MAX_FLOORS: 5,
  PLAYER_SPEED: 180,  // px/s
  ATTACK_RANGE: TILE * 1.4,
  ATTACK_COOLDOWN: 0.55,  // seconds
  ENEMY_DETECT_RANGE: TILE * 8,
  ENEMY_ATTACK_RANGE: TILE * 1.2,
};

export const TILES = {
  VOID:  0,
  FLOOR: 1,
  WALL:  2,
  DOOR:  3,
  STAIRS:4,
  TRAP:  5,
};

export const RARITY = {
  COMMON:    { id: 'common',    label: 'Common',    weight: 50, color: '#8a8a8a' },
  UNCOMMON:  { id: 'uncommon',  label: 'Uncommon',  weight: 30, color: '#4caf50' },
  RARE:      { id: 'rare',      label: 'Rare',       weight: 14, color: '#2196f3' },
  EPIC:      { id: 'epic',      label: 'Epic',       weight: 5,  color: '#9c27b0' },
  LEGENDARY: { id: 'legendary', label: 'Legendary', weight: 1,  color: '#ff9800' },
};

export const ENEMY_TYPES = {
  goblin:   { name: 'Goblin',   icon: '👹', hp: 30,  atk: 5,  speed: 80,  xp: 10, gold: [2,8] },
  zombie:   { name: 'Zombie',   icon: '🧟', hp: 50,  atk: 8,  speed: 50,  xp: 15, gold: [3,10] },
  skeleton: { name: 'Skeleton', icon: '💀', hp: 40,  atk: 12, speed: 70,  xp: 20, gold: [5,14] },
  wraith:   { name: 'Wraith',   icon: '👻', hp: 35,  atk: 15, speed: 100, xp: 25, gold: [6,16] },
  ogre:     { name: 'Ogre',     icon: '👾', hp: 80,  atk: 18, speed: 45,  xp: 35, gold: [8,20] },
  boss:     { name: 'Dungeon Lord', icon: '🐉', hp: 500, atk: 25, speed: 60, xp: 200, gold: [80,200] },
};

export const ITEM_POOL = [
  { id: 'iron_sword',    name: 'Iron Sword',      icon: '⚔️',  type: 'weapon', stat: 'atk', val: [8,14] },
  { id: 'shadow_blade',  name: 'Shadow Blade',    icon: '🗡️',  type: 'weapon', stat: 'atk', val: [20,30] },
  { id: 'dragon_sword',  name: 'Dragon Sword',    icon: '⚔️',  type: 'weapon', stat: 'atk', val: [45,60] },
  { id: 'leather_helm',  name: 'Leather Helm',    icon: '🪖',  type: 'armor',  stat: 'def', val: [3,6]  },
  { id: 'iron_shield',   name: 'Iron Shield',     icon: '🛡️',  type: 'armor',  stat: 'def', val: [8,14] },
  { id: 'mage_robe',     name: 'Mage Robe',       icon: '👘',  type: 'armor',  stat: 'def', val: [4,8]  },
  { id: 'hp_potion',     name: 'Health Potion',   icon: '🧪',  type: 'potion', stat: 'hp',  val: [30,60] },
  { id: 'elixir',        name: 'Grand Elixir',    icon: '⚗️',  type: 'potion', stat: 'hp',  val: [80,120] },
  { id: 'gold_coin',     name: 'Gold Coins',      icon: '🪙',  type: 'gold',   stat: 'gold',val: [20,80] },
  { id: 'gem',           name: 'Gemstone',        icon: '💎',  type: 'gold',   stat: 'gold',val: [50,150] },
  { id: 'amulet',        name: 'Amulet of Power', icon: '📿',  type: 'armor',  stat: 'def', val: [5,10]  },
];
