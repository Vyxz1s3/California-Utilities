/**
 * Economy utility helpers shared across all economy commands.
 */
import { query } from '../database/db.js';
import { getOrCreateUser } from './helpers.js';

// ─── Cooldown helpers (DB-backed, survives restarts) ────────────────────────

/**
 * Check and set a per-user, per-command cooldown stored in the database.
 * Returns { onCooldown, timeLeft } where timeLeft is a human-readable string.
 */
export async function checkEconomyCooldown(userId, command) {
  const now = new Date();

  const res = await query(
    'SELECT expires_at FROM user_cooldowns WHERE user_id = $1 AND command = $2',
    [userId, command]
  );

  if (res.rows.length > 0) {
    const expiresAt = new Date(res.rows[0].expires_at);
    if (now < expiresAt) {
      const diffMs = expiresAt - now;
      return { onCooldown: true, timeLeft: formatDuration(diffMs) };
    }
  }

  return { onCooldown: false };
}

/**
 * Set the cooldown expiry for a user/command pair.
 * @param {string} userId
 * @param {string} command
 * @param {number} seconds
 */
export async function setEconomyCooldown(userId, command, seconds) {
  const expiresAt = new Date(Date.now() + seconds * 1000);
  await query(
    `INSERT INTO user_cooldowns (user_id, command, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, command) DO UPDATE SET expires_at = $3`,
    [userId, command, expiresAt]
  );
}

function formatDuration(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─── Balance helpers ─────────────────────────────────────────────────────────

export async function getBalance(userId) {
  const user = await getOrCreateUser(userId);
  return { wallet: user.balance, bank: user.bank };
}

export async function addToWallet(userId, amount) {
  await getOrCreateUser(userId);
  const res = await query(
    'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
    [amount, userId]
  );
  return res.rows[0].balance;
}

export async function removeFromWallet(userId, amount) {
  const user = await getOrCreateUser(userId);
  if (user.balance < amount) return null; // insufficient funds
  const res = await query(
    'UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING balance',
    [amount, userId]
  );
  return res.rows[0].balance;
}

export async function addToBank(userId, amount) {
  await getOrCreateUser(userId);
  const res = await query(
    'UPDATE users SET bank = bank + $1 WHERE id = $2 RETURNING bank',
    [amount, userId]
  );
  return res.rows[0].bank;
}

export async function removeFromBank(userId, amount) {
  const user = await getOrCreateUser(userId);
  if (user.bank < amount) return null;
  const res = await query(
    'UPDATE users SET bank = bank - $1 WHERE id = $2 RETURNING bank',
    [amount, userId]
  );
  return res.rows[0].bank;
}

// ─── XP helpers ──────────────────────────────────────────────────────────────

export async function addGlobalXP(userId, amount) {
  await getOrCreateUser(userId);
  await query(
    'UPDATE users SET xp = xp + $1 WHERE id = $2',
    [amount, userId]
  );
}

// ─── Inventory helpers ───────────────────────────────────────────────────────

export async function getItemByName(name) {
  const res = await query(
    'SELECT * FROM economy_items WHERE LOWER(name) = LOWER($1)',
    [name]
  );
  return res.rows[0] || null;
}

export async function getUserInventory(userId) {
  const res = await query(
    `SELECT ei.*, ui.quantity
     FROM user_inventory ui
     JOIN economy_items ei ON ei.id = ui.item_id
     WHERE ui.user_id = $1
     ORDER BY ei.rarity, ei.name`,
    [userId]
  );
  return res.rows;
}

export async function addItemToInventory(userId, itemId, quantity = 1) {
  await query(
    `INSERT INTO user_inventory (user_id, item_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = user_inventory.quantity + $3`,
    [userId, itemId, quantity]
  );
}

export async function removeItemFromInventory(userId, itemId, quantity = 1) {
  const res = await query(
    'SELECT quantity FROM user_inventory WHERE user_id = $1 AND item_id = $2',
    [userId, itemId]
  );
  if (res.rows.length === 0 || res.rows[0].quantity < quantity) return false;

  if (res.rows[0].quantity === quantity) {
    await query(
      'DELETE FROM user_inventory WHERE user_id = $1 AND item_id = $2',
      [userId, itemId]
    );
  } else {
    await query(
      'UPDATE user_inventory SET quantity = quantity - $1 WHERE user_id = $2 AND item_id = $3',
      [quantity, userId, itemId]
    );
  }
  return true;
}

// ─── Net worth ───────────────────────────────────────────────────────────────

export async function getNetWorth(userId) {
  const user = await getOrCreateUser(userId);
  const inv = await getUserInventory(userId);
  const inventoryValue = inv.reduce((sum, item) => sum + item.sell_price * item.quantity, 0);
  return { wallet: user.balance, bank: user.bank, inventoryValue, total: user.balance + user.bank + inventoryValue };
}

// ─── Achievement helpers ──────────────────────────────────────────────────────

export const ACHIEVEMENTS = {
  first_money:      { id: 'first_money',      name: 'First Money',      description: 'Earn your first 100 coins.',          emoji: '💰' },
  rich:             { id: 'rich',             name: 'Rich',             description: 'Accumulate 10,000 coins.',             emoji: '🤑' },
  millionaire:      { id: 'millionaire',      name: 'Millionaire',      description: 'Accumulate 1,000,000 coins.',          emoji: '💎' },
  gambler:          { id: 'gambler',          name: 'Gambler',          description: 'Win 10 gambling games.',               emoji: '🎰' },
  lucky:            { id: 'lucky',            name: 'Lucky',            description: 'Win 50 gambling games.',               emoji: '🍀' },
  fisherman:        { id: 'fisherman',        name: 'Fisherman',        description: 'Catch 50 fish.',                       emoji: '🎣' },
  miner:            { id: 'miner',            name: 'Miner',            description: 'Mine 50 ore.',                         emoji: '⛏️' },
  farmer:           { id: 'farmer',           name: 'Farmer',           description: 'Harvest 50 crops.',                   emoji: '🌾' },
  pet_lover:        { id: 'pet_lover',        name: 'Pet Lover',        description: 'Adopt a pet.',                         emoji: '🐾' },
  business_owner:   { id: 'business_owner',   name: 'Business Owner',   description: 'Create a business.',                   emoji: '🏢' },
};

export async function getUserAchievements(userId) {
  const res = await query(
    'SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1',
    [userId]
  );
  return res.rows;
}

export async function unlockAchievement(userId, achievementId) {
  try {
    await query(
      `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, achievementId]
    );
  } catch (_) { /* ignore */ }
}

/**
 * Check balance-based achievements and unlock them if earned.
 */
export async function checkBalanceAchievements(userId) {
  const user = await getOrCreateUser(userId);
  const total = user.balance + user.bank;
  if (total >= 100)       await unlockAchievement(userId, 'first_money');
  if (total >= 10000)     await unlockAchievement(userId, 'rich');
  if (total >= 1000000)   await unlockAchievement(userId, 'millionaire');
}

// ─── Rarity colour map ───────────────────────────────────────────────────────

export const RARITY_COLOURS = {
  common:    '#aaaaaa',
  uncommon:  '#1eff00',
  rare:      '#0070dd',
  special:   '#a335ee',
  legendary: '#ff8000',
};
