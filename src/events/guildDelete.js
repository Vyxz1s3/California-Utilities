import { query } from '../database/db.js';

export default {
  name: 'guildDelete',
  async execute(client, guild) {
    console.log(`❌ Bot left guild: ${guild.name} (${guild.id})`);
    
    // Optional: Delete guild data from database
    // await query('DELETE FROM guilds WHERE id = $1', [guild.id]);
  },
};

