import { ActivityType } from 'discord.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    
    client.user.setActivity('California Utilities', { type: ActivityType.Watching });
    
    // Register slash commands globally
    try {
      const commands = Array.from(client.slashCommands.values()).map(cmd => cmd.data);
      await client.application.commands.set(commands);
      console.log(`📝 Registered ${commands.length} slash commands globally`);
    } catch (err) {
      console.error('Error registering slash commands:', err);
    }
  },
};

