import { EmbedBuilder } from 'discord.js';
import { checkCooldown } from '../utils/cooldown.js';
import { getOrCreateGuild } from '../utils/helpers.js';

export default {
  name: 'interactionCreate',
  async execute(client, interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

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
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: '❌ There was an error while executing this command!',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: '❌ There was an error while executing this command!',
            ephemeral: true,
          });
        }
      }
    }

    // Handle button interactions
    if (interaction.isButton()) {
      // Verify button
      if (interaction.customId === 'verify_start_button') {
        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle('🎮 Roblox Verification')
          .setDescription(
            'To verify your Roblox account, use the following command:\n\n' +
            '```\n/verify start <your_roblox_username>\n```\n\n' +
            'Replace `<your_roblox_username>` with your exact Roblox username (case-sensitive).'
          )
          .addFields(
            {
              name: '📝 Example',
              value: '```\n/verify start BuilderBob123\n```',
              inline: false,
            },
            {
              name: '⏱️ Time Limit',
              value: 'You have **10 minutes** to complete the verification process after getting your code.',
              inline: false,
            }
          )
          .setFooter({ text: 'Use /verify start to begin' })
          .setTimestamp();

        return interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }
    }

    // Handle select menus
    if (interaction.isStringSelectMenu()) {
      // Add select menu handlers here if needed
    }

    // Handle modal submissions
    if (interaction.isModalSubmit()) {
      // Add modal handlers here if needed
    }
  },
};

