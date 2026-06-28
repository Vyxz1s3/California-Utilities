import axios from 'axios';

const ROBLOX_USERS_API = 'https://users.roblox.com/v1/usernames/users';
const ROBLOX_USERS_BY_ID_API = 'https://users.roblox.com/v1/users';

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
 * Look up a Roblox user by their numeric user ID.
 *
 * @param {number|string} userId - The Roblox user ID.
 * @returns {Promise<{ id: number, name: string, displayName: string } | null>}
 */
export async function getRobloxUserById(userId) {
  try {
    const response = await axios.get(`${ROBLOX_USERS_BY_ID_API}/${userId}`, {
      timeout: 10_000,
    });
    return response.data ?? null;
  } catch (err) {
    console.error('[RobloxAPI] Error fetching user by ID:', err.message);
    return null;
  }
}

/**
 * Fetch a Roblox user's full profile, including their bio/description.
 *
 * @param {number|string} userId - The Roblox user ID.
 * @returns {Promise<{ id: number, name: string, displayName: string, description: string } | null>}
 */
export async function getRobloxUserProfile(userId) {
  try {
    const response = await axios.get(`${ROBLOX_USERS_BY_ID_API}/${userId}`, {
      timeout: 10_000,
    });
    // The /v1/users/:id endpoint returns id, name, displayName, description, etc.
    return response.data ?? null;
  } catch (err) {
    console.error('[RobloxAPI] Error fetching user profile:', err.message);
    return null;
  }
}
