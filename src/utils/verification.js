/**
 * Shared verification helpers used by both the /verify user subcommand
 * and the /verify-embed button-modal flow.
 */

import { EmbedBuilder } from 'discord.js';
import { query } from '../database/db.js';
import { getRobloxUser } from './robloxApi.js';

// ─── Database helpers ─────────────────────────────────────────────────────────

/** Fetch the verification settings for a guild, or null if none exist. */
export async function getVerificationSettings(guildId) {
  const result = await query(
    'SELECT * FROM guild_verification_settings WHERE guild_id = $1',
    [guildId]
  );
  return result.rows[0] ?? null;
}

/** Store or update a user's Roblox verification record. */
export async function upsertRobloxVerification(guildId, userId, robloxUsername, robloxUserId) {
  await query(
    `INSERT INTO roblox_verifications (guild_id, user_id, roblox_username, roblox_user_id, verified_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     ON CONFLICT (guild_id, user_id) DO UPDATE
       SET roblox_username = $3, roblox_user_id = $4, verified_at = CURRENT_TIMESTAMP`,
    [guildId, userId, robloxUsername, robloxUserId]
  );
}

// ─── Attempt tracking ─────────────────────────────────────────────────────────

/** Maximum number of verification attempts before a cooldown is imposed. */
export const MAX_ATTEMPTS = 3;

/** Cooldown duration in milliseconds after exhausting attempts (10 minutes). */
export const ATTEMPT_COOLDOWN_MS = 10 * 60 * 1000;

/**
 * Fetch the current attempt record for a user in a guild.
 * @returns {{ attempts: number, last_attempt_at: Date } | null}
 */
export async function getAttemptRecord(guildId, userId) {
  const result = await query(
    'SELECT * FROM user_verification_attempts WHERE guild_id = $1 AND user_id = $2',
    [guildId, userId]
  );
  return result.rows[0] ?? null;
}

/**
 * Increment the attempt counter for a user, resetting if the cooldown window
 * has passed.
 */
export async function incrementAttempts(guildId, userId) {
  await query(
    `INSERT INTO user_verification_attempts (guild_id, user_id, attempts, last_attempt_at)
     VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
     ON CONFLICT (guild_id, user_id) DO UPDATE
       SET attempts = CASE
             WHEN user_verification_attempts.last_attempt_at < NOW() - INTERVAL '10 minutes'
             THEN 1
             ELSE user_verification_attempts.attempts + 1
           END,
           last_attempt_at = CURRENT_TIMESTAMP`,
    [guildId, userId]
  );
}

/** Reset the attempt counter for a user (called on successful verification). */
export async function resetAttempts(guildId, userId) {
  await query(
    `UPDATE user_verification_attempts SET attempts = 0 WHERE guild_id = $1 AND user_id = $2`,
    [guildId, userId]
  );
}

/**
 * Check whether a user is currently rate-limited.
 * Returns { limited: false } or { limited: true, retryAfterMs: number }.
 */
export async function checkAttemptLimit(guildId, userId) {
  const record = await getAttemptRecord(guildId, userId);
  if (!record) return { limited: false };

  const lastAttempt = new Date(record.last_attempt_at).getTime();
  const now = Date.now();
  const windowExpired = now - lastAttempt > ATTEMPT_COOLDOWN_MS;

  if (windowExpired) return { limited: false };
  if (record.attempts >= MAX_ATTEMPTS) {
    return { limited: true, retryAfterMs: ATTEMPT_COOLDOWN_MS - (now - lastAttempt) };
  }

  return { limited: false };
}

// ─── Core verification logic ──────────────────────────────────────────────────

/**
 * Perform the full verification flow for a guild member:
 *  1. Validate the Roblox username via the API.
 *  2. Assign the verified role.
 *  3. Remove the unverified role.
 *  4. Persist the record to the database.
 *
 * @param {import('discord.js').GuildMember} member
 * @param {string} robloxUsername
 * @param {object} settings  - Row from guild_verification_settings
 * @returns {Promise<{ success: boolean, robloxUser?: object, rolesChanged?: boolean, error?: string }>}
 */
export async function performVerification(member, robloxUsername, settings) {
  // 1. Validate via Roblox API
  const robloxUser = await getRobloxUser(robloxUsername);
  if (!robloxUser) {
    return { success: false, error: 'roblox_not_found' };
  }

  // 2. Assign verified role
  let rolesChanged = false;
  if (settings?.verified_role_id) {
    const verifiedRole = member.guild.roles.cache.get(String(settings.verified_role_id));
    if (verifiedRole) {
      try {
        await member.roles.add(verifiedRole, 'Roblox verification');
        rolesChanged = true;
      } catch {
        // Bot may lack permissions — still store the verification
      }
    }
  }

  // 3. Remove unverified role
  if (settings?.unverified_role_id) {
    const unverifiedRole = member.guild.roles.cache.get(String(settings.unverified_role_id));
    if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
      await member.roles.remove(unverifiedRole, 'Roblox verification').catch(() => {});
    }
  }

  // 4. Persist to database
  await upsertRobloxVerification(
    member.guild.id,
    member.id,
    robloxUser.name,
    robloxUser.id
  );

  return { success: true, robloxUser, rolesChanged };
}

// ─── Embed builders ───────────────────────────────────────────────────────────

/** Build the public-facing verification embed that admins post in a channel. */
export function buildVerificationEmbed({ title, description, color }) {
  return new EmbedBuilder()
    .setColor(color ?? 0x5865f2)
    .setTitle(title ?? '🎮 Roblox Verification')
    .setDescription(
      (description ?? '') ||
      'Click the **Start Verification** button below to link your Roblox account.\n\n' +
      'You will be asked for your **Roblox username** and a quick **CAPTCHA** to confirm ' +
      'you are human. Once verified you will receive the verified role automatically.'
    )
    .setFooter({ text: 'You may only verify once per server.' })
    .setTimestamp();
}

/** Build the success embed shown after a successful verification. */
export function buildSuccessEmbed(robloxUser, settings, rolesChanged) {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('✅ Verification Successful!')
    .setDescription(
      `You've been verified as **${robloxUser.name}** on Roblox. Welcome to the server!`
    )
    .addFields(
      { name: '🎮 Roblox Username', value: robloxUser.name, inline: true },
      { name: '🆔 Roblox User ID',  value: String(robloxUser.id), inline: true },
      {
        name: '🎭 Role',
        value: rolesChanged && settings?.verified_role_id
          ? `<@&${settings.verified_role_id}> has been assigned.`
          : settings?.verified_role_id
            ? '⚠️ Role could not be assigned — check bot permissions.'
            : 'No verified role is configured yet. Ask an admin to run `/verify setup`.',
        inline: false,
      }
    )
    .setFooter({ text: 'Your Roblox account is now linked to your Discord profile.' })
    .setTimestamp();
}
