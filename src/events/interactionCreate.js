import { checkCooldown } from '../utils/cooldown.js';
import { getOrCreateGuild } from '../utils/helpers.js';

export default {
  name: 'interactionCreate',
  async execute(client, interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      // Check cooldown
      const cooldown = checkCooldown(client, interaction.user.id, interaction.commandName, 3);
      if (cooldown.onCooldown) {
        return interaction.reply({
          content: `⏱️ You're on cooldown! Try again in ${cooldown.timeLeft}s`,
          ephemeral: true,
        });
      }

      // Ensure guild exists in database
      if (interaction.guild) {
        await getOrCreateGuild(interaction.guild.id, interaction.guild.name);
      }

      await command.execute(interaction, client);
    } catch (err) {
      console.error(`Error executing slash command ${interaction.commandName}:`, err);
      const reply = {
        content: '❌ An error occurred while executing this command.',
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};

