import axios from 'axios';

const ROBLOX_USERS_API = 'https://users.roblox.com/v1/usernames/users';

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
