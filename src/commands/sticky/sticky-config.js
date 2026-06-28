import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('sticky-config')
    .setDescription('Configure sticky message behaviour')
    .addIntegerOption(o => o.setName('delay').setDescription('Delay in seconds before re-sticking (default: 5)').setRequired(false).setMinValue(1).setMaxValue(60))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'sticky-config',
  description: 'Configure sticky message behaviour',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const delay = interaction.options.getInteger('delay') || 5;

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('⚙️ Sticky Message Configuration')
      .addFields(
        { name: '⏱️ Re-stick Delay', value: `${delay} seconds`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
