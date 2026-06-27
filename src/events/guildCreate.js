import { getOrCreateGuild } from '../utils/helpers.js';

export default {
  name: 'guildCreate',
  async execute(client, guild) {
    console.log(`✅ Bot joined guild: ${guild.name} (${guild.id})`);
    
    // Create guild in database
    await getOrCreateGuild(guild.id, guild.name);
  },
};

