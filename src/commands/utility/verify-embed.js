import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('verify-embed')
    .setDescription('Send a Roblox verification embed to this channel (admin only)')
    .addSubcommand(sub =>
      sub
        .setName('send')
        .setDescription('Send the verification embed to the current channel')
        .addStringOption(opt =>
          opt
            .setName('title')
            .setDescription('Custom embed title (optional)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt
            .setName('description')
            .setDescription('Custom embed description (optional)')
            .setRequired(false)
        )
    ),

  name: 'verify-embed',
  description: 'Send a Roblox verification embed to this channel (admin only)',

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'send') {
      // Permission check
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({
          content: '❌ You need the **Manage Server** permission to send a verification embed.',
          ephemeral: true,
        });
      }

      const customTitle = interaction.options.getString('title');
      const customDescription = interaction.options.getString('description');

      const title = customTitle ?? '🎮 Roblox Verification';
      const description =
        customDescription ??
        'Verify your Roblox account to unlock full access to this server!\n\n' +
        '**How it works:**\n' +
        '1. Click **Start Verification** below\n' +
        '2. You\'ll receive a unique 6-character code in your DMs\n' +
        '3. Add the code to your Roblox profile bio\n' +
        '4. Click **Verify Now** in the DM to complete verification\n\n' +
        '*Make sure your DMs are open so the bot can send you your code.*';

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: 'Your code expires 1 hour after it is generated.' })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('roblox_start_verification')
          .setLabel('Start Verification')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎮')
      );

      // Send the embed to the current channel (not ephemeral — it's a public panel)
      await interaction.channel.send({ embeds: [embed], components: [row] });

      // Acknowledge the command ephemerally so the admin knows it worked
      return interaction.reply({
        content: '✅ Verification embed sent successfully!',
        ephemeral: true,
      });
    }
  },
};
