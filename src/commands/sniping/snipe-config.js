import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('snipe-config')
    .setDescription('Configure the message sniping system')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable sniping').setRequired(true))
    .addIntegerOption(o => o.setName('cache_size').setDescription('Number of messages to cache per channel (default: 1)').setRequired(false).setMinValue(1).setMaxValue(10))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'snipe-config',
  description: 'Configure the message sniping system',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const enabled = interaction.options.getBoolean('enabled');
    const cacheSize = interaction.options.getInteger('cache_size') || 1;

    const embed = new EmbedBuilder()
      .setColor(enabled ? 0x2ECC71 : 0xE74C3C)
      .setTitle('⚙️ Snipe Configuration')
      .addFields(
        { name: '✅ Enabled', value: enabled ? 'Yes' : 'No', inline: true },
        { name: '📦 Cache Size', value: `${cacheSize} per channel`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
