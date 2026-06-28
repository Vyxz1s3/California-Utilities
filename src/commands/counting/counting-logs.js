import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('counting-logs')
    .setDescription('View counting channel logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'counting-logs',
  description: 'View counting channel logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 Counting Logs')
      .setDescription('Counting logs are tracked in real-time. Use `/counting-stats` to see current statistics.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
