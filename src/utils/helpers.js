import { query } from '../database/db.js';

export async function getOrCreateUser(userId) {
  const result = await query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    await query(
      'INSERT INTO users (id) VALUES ($1)',
      [userId]
    );
    return { id: userId, balance: 0, bank: 0, level: 1, xp: 0, warnings: 0 };
  }

  return result.rows[0];
}

export async function getOrCreateGuild(guildId, guildName) {
  const result = await query(
    'SELECT * FROM guilds WHERE id = $1',
    [guildId]
  );

  if (result.rows.length === 0) {
    await query(
      'INSERT INTO guilds (id, name) VALUES ($1, $2)',
      [guildId, guildName]
    );
    return { id: guildId, name: guildName, prefix: '!' };
  }

  return result.rows[0];
}

export async function getOrCreateMember(guildId, userId) {
  const result = await query(
    'SELECT * FROM members WHERE guild_id = $1 AND user_id = $2',
    [guildId, userId]
  );

  if (result.rows.length === 0) {
    await query(
      'INSERT INTO members (guild_id, user_id) VALUES ($1, $2)',
      [guildId, userId]
    );
    return { guild_id: guildId, user_id: userId, level: 1, xp: 0, warnings: 0 };
  }

  return result.rows[0];
}

export async function addXP(guildId, userId, amount) {
  const member = await getOrCreateMember(guildId, userId);
  const newXP = member.xp + amount;
  const xpPerLevel = 1000;
  const newLevel = Math.floor(newXP / xpPerLevel) + 1;

  await query(
    'UPDATE members SET xp = $1, level = $2 WHERE guild_id = $3 AND user_id = $4',
    [newXP, newLevel, guildId, userId]
  );

  return { newXP, newLevel, leveledUp: newLevel > member.level };
}

export async function addBalance(userId, amount) {
  const user = await getOrCreateUser(userId);
  const newBalance = user.balance + amount;

  await query(
    'UPDATE users SET balance = $1 WHERE id = $2',
    [newBalance, userId]
  );

  return newBalance;
}

export async function addWarning(guildId, userId, reason) {
  const member = await getOrCreateMember(guildId, userId);
  const newWarnings = member.warnings + 1;

  await query(
    'UPDATE members SET warnings = $1 WHERE guild_id = $2 AND user_id = $3',
    [newWarnings, guildId, userId]
  );

  await query(
    'INSERT INTO modlogs (guild_id, user_id, action, reason) VALUES ($1, $2, $3, $4)',
    [guildId, userId, 'warn', reason]
  );

  return newWarnings;
}

export function formatNumber(num) {
  return num.toLocaleString();
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

