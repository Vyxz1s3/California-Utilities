import { checkCooldown } from '../utils/cooldown.js';
import { getOrCreateGuild } from '../utils/helpers.js';
import { handleVerifyEmbedInteraction } from '../commands/utility/verify.js';

export default {
  name: 'interactionCreate',
  async execute(client, interaction) {
    // ── Persistent verify-embed button / modal interactions ──────────────────
    const isVerifyEmbedInteraction =
      (interaction.isButton() || interaction.isModalSubmit()) &&
      (interaction.customId === 'verify_embed_start' ||
       interaction.customId === 'verify_embed_modal');

    if (isVerifyEmbedInteraction) {
      try {
        await handleVerifyEmbedInteraction(interaction);
      } catch (err) {
        console.error('[verify-embed] Error handling interaction:', err);
        const reply = { content: '❌ An error occurred during verification. Please try again.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }
      return;
    }

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

