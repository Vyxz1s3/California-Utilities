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
 * Fetch a Roblox user's full profile by their numeric user ID.
 *
 * @param {number|string} userId - The Roblox user ID.
 * @returns {Promise<{ id: number, name: string, displayName: string, description: string } | null>}
 *   The profile object (including the "About" description), or null on failure.
 */
export async function getRobloxUserProfile(userId) {
  try {
    const response = await axios.get(`${ROBLOX_USER_API}/${userId}`, {
      timeout: 10_000,
    });

    return response.data ?? null; // { id, name, displayName, description, ... }
  } catch (err) {
    console.error('[RobloxAPI] Error fetching user profile:', err.message);
    return null;
  }
}

/**
 * Check whether a verification code appears in a Roblox user's "About" section.
 *
 * @param {number|string} robloxUserId - The Roblox user ID to inspect.
 * @param {string} code - The verification code to search for.
 * @returns {Promise<boolean>} True if the code is present in the profile description.
 */
export async function checkCodeInAbout(robloxUserId, code) {
  const profile = await getRobloxUserProfile(robloxUserId);
  if (!profile) return false;
  return String(profile.description ?? '').includes(String(code));
}
