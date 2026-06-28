import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('starboard-config')
    .setDescription('Configure the starboard')
    .addChannelOption(o => o.setName('channel').setDescription('Starboard channel').setRequired(false))
    .addIntegerOption(o => o.setName('threshold').setDescription('Stars needed to appear on starboard (default: 3)').setRequired(false).setMinValue(1).setMaxValue(50))
    .addStringOption(o => o.setName('emoji').setDescription('Star emoji (default: ⭐)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'starboard-config',
  description: 'Configure the starboard',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    const threshold = interaction.options.getInteger('threshold') || 3;
    const emoji = interaction.options.getString('emoji') || '⭐';

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('⭐ Starboard Configuration')
      .addFields(
        { name: '📢 Channel', value: channel ? `${channel}` : 'Not set', inline: true },
        { name: '🔢 Threshold', value: `${threshold} stars`, inline: true },
        { name: '⭐ Emoji', value: emoji, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
