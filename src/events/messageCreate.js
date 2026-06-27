import { checkCooldown } from '../utils/cooldown.js';
import { getOrCreateGuild } from '../utils/helpers.js';

export default {
  name: 'messageCreate',
  async execute(client, message) {
    if (message.author.bot || !message.guild) return;

    // Get guild prefix
    const guildData = await getOrCreateGuild(message.guild.id, message.guild.name);
    const prefix = guildData.prefix || '!';

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
      // Check cooldown
      const cooldown = checkCooldown(client, message.author.id, commandName, 3);
      if (cooldown.onCooldown) {
        return message.reply(`⏱️ You're on cooldown! Try again in ${cooldown.timeLeft}s`);
      }

      await command.execute(message, args, client);
    } catch (err) {
      console.error(`Error executing prefix command ${commandName}:`, err);
      message.reply('❌ An error occurred while executing this command.');
    }
  },
};

