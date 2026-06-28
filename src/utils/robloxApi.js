import axios from 'axios';

const ROBLOX_USERS_API = 'https://users.roblox.com/v1/usernames/users';
const ROBLOX_USER_API  = 'https://users.roblox.com/v1/users';

/**
 * Look up a Roblox user by username.
 *
 * @param {string} username - The Roblox username to validate.
 * @returns {Promise<{ id: number, name: string, displayName: string } | null>}
 *   The user object if found and not banned, or null if the username is invalid.
 */
export async function getRobloxUser(username) {
  try {
    const response = await axios.post(
      ROBLOX_USERS_API,
      { usernames: [username], excludeBannedUsers: true },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10_000,
      }
    );

    const data = response.data?.data;
    if (!Array.isArray(data) || data.length === 0) return null;

    return data[0]; // { id, name, displayName }
  } catch (err) {
    // Network errors, rate-limits, etc. — treat as "not found" so the caller
    // can surface a friendly error message rather than crashing.
    console.error('[RobloxAPI] Error fetching user:', err.message);
    return null;
  }
}

/**
 * Fetch a Roblox user's full profile, including their bio (description).
 *
 * @param {number|string} userId - The numeric Roblox user ID.
 * @returns {Promise<{ id: number, name: string, displayName: string, description: string } | null>}
 */
export async function getRobloxUserProfile(userId) {
  try {
    const response = await axios.get(`${ROBLOX_USER_API}/${userId}`, {
      timeout: 10_000,
    });

    return response.data ?? null; // { id, name, displayName, description, ... }
  } catch (err) {
    console.error('[RobloxAPI] Error fetching profile:', err.message);
    return null;
  }
}

/**
 * Check whether a verification code appears in a Roblox user's profile bio.
 *
 * @param {number|string} userId - The numeric Roblox user ID.
 * @param {string}        code   - The verification code to look for.
 * @returns {Promise<boolean>}
 */
export async function verifyCodeInProfile(userId, code) {
  const profile = await getRobloxUserProfile(userId);
  if (!profile) return false;
  return typeof profile.description === 'string' && profile.description.includes(code);
}
