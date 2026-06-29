import { query } from '../database/db.js';

/**
 * Create a new moderation case
 */
export async function createModerationCase(guildId, userId, moderatorId, action, reason, duration = null) {
  const caseId = await getNextCaseId(guildId);
  let expiresAt = null;

  if (duration) {
    expiresAt = new Date(Date.now() + duration);
  }

  const result = await query(
    `INSERT INTO moderation_cases (guild_id, case_id, user_id, moderator_id, action, reason, duration, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [guildId, caseId, userId, moderatorId, action, reason, duration ? `${duration}ms` : null, expiresAt]
  );

  return result.rows[0];
}

/**
 * Get the next case ID for a guild
 */
export async function getNextCaseId(guildId) {
  const result = await query(
    'SELECT MAX(case_id) as max_id FROM moderation_cases WHERE guild_id = $1',
    [guildId]
  );

  const maxId = result.rows[0]?.max_id || 0;
  return maxId + 1;
}

/**
 * Get all moderation cases for a user
 */
export async function getModerationCases(guildId, userId) {
  const result = await query(
    'SELECT * FROM moderation_cases WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC',
    [guildId, userId]
  );

  return result.rows;
}

/**
 * Get a specific case by ID
 */
export async function getCase(guildId, caseId) {
  const result = await query(
    'SELECT * FROM moderation_cases WHERE guild_id = $1 AND case_id = $2',
    [guildId, caseId]
  );

  return result.rows[0] || null;
}

/**
 * Add a warning to a user
 */
export async function addWarning(guildId, userId, moderatorId, reason) {
  const result = await query(
    `INSERT INTO user_warnings (guild_id, user_id, moderator_id, reason)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [guildId, userId, moderatorId, reason]
  );

  return result.rows[0];
}

/**
 * Get all warnings for a user
 */
export async function getWarnings(guildId, userId) {
  const result = await query(
    'SELECT * FROM user_warnings WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC',
    [guildId, userId]
  );

  return result.rows;
}

/**
 * Clear all warnings for a user
 */
export async function clearWarnings(guildId, userId) {
  await query(
    'DELETE FROM user_warnings WHERE guild_id = $1 AND user_id = $2',
    [guildId, userId]
  );
}

/**
 * Log a message (deleted or edited)
 */
export async function logMessage(guildId, channelId, userId, messageId, content, action, beforeContent = null, afterContent = null) {
  await query(
    `INSERT INTO message_logs (guild_id, channel_id, user_id, message_id, content, action, before_content, after_content)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [guildId, channelId, userId, messageId, content, action, beforeContent, afterContent]
  );
}

/**
 * Get message logs for a user
 */
export async function getMessageLogs(guildId, userId, limit = 10) {
  const result = await query(
    'SELECT * FROM message_logs WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT $3',
    [guildId, userId, limit]
  );

  return result.rows;
}

/**
 * Log member activity (join/leave)
 */
export async function logMember(guildId, userId, action, rolesBefore = null) {
  await query(
    `INSERT INTO member_logs (guild_id, user_id, action, roles_before)
     VALUES ($1, $2, $3, $4)`,
    [guildId, userId, action, rolesBefore ? JSON.stringify(rolesBefore) : null]
  );
}

/**
 * Get member logs
 */
export async function getMemberLogs(guildId, limit = 20) {
  const result = await query(
    'SELECT * FROM member_logs WHERE guild_id = $1 ORDER BY created_at DESC LIMIT $2',
    [guildId, limit]
  );

  return result.rows;
}

/**
 * Get moderation settings for a guild
 */
export async function getModerationSettings(guildId) {
  const result = await query(
    'SELECT * FROM guild_moderation_settings WHERE guild_id = $1',
    [guildId]
  );

  return result.rows[0] || null;
}

/**
 * Update moderation settings for a guild
 */
export async function updateModerationSettings(guildId, settings) {
  const keys = Object.keys(settings);
  const values = Object.values(settings);
  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');

  await query(
    `INSERT INTO guild_moderation_settings (guild_id, ${keys.join(', ')})
     VALUES ($1, ${keys.map((_, i) => `$${i + 2}`).join(', ')})
     ON CONFLICT (guild_id) DO UPDATE SET ${setClause}, updated_at = CURRENT_TIMESTAMP`,
    [guildId, ...values]
  );
}

/**
 * Add a moderator note to a user
 */
export async function addModeratorNote(guildId, userId, moderatorId, note) {
  const result = await query(
    `INSERT INTO moderator_notes (guild_id, user_id, moderator_id, note)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [guildId, userId, moderatorId, note]
  );

  return result.rows[0];
}

/**
 * Get all moderator notes for a user
 */
export async function getModeratorNotes(guildId, userId) {
  const result = await query(
    'SELECT * FROM moderator_notes WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC',
    [guildId, userId]
  );

  return result.rows;
}

/**
 * Remove a moderator note
 */
export async function removeModeratorNote(noteId) {
  await query(
    'DELETE FROM moderator_notes WHERE id = $1',
    [noteId]
  );
}

/**
 * Create a punishment appeal
 */
export async function createAppeal(guildId, userId, caseId, reason) {
  const result = await query(
    `INSERT INTO punishment_appeals (guild_id, user_id, case_id, reason)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [guildId, userId, caseId, reason]
  );

  return result.rows[0];
}

/**
 * Get pending appeals for a guild
 */
export async function getPendingAppeals(guildId) {
  const result = await query(
    'SELECT * FROM punishment_appeals WHERE guild_id = $1 AND status = $2 ORDER BY created_at DESC',
    [guildId, 'pending']
  );

  return result.rows;
}

/**
 * Approve an appeal
 */
export async function approveAppeal(appealId, response) {
  await query(
    'UPDATE punishment_appeals SET status = $1, response = $2, resolved_at = CURRENT_TIMESTAMP WHERE id = $3',
    ['approved', response, appealId]
  );
}

/**
 * Deny an appeal
 */
export async function denyAppeal(appealId, response) {
  await query(
    'UPDATE punishment_appeals SET status = $1, response = $2, resolved_at = CURRENT_TIMESTAMP WHERE id = $3',
    ['denied', response, appealId]
  );
}

