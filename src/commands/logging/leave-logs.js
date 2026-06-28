import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leave-logs')
    .setDescription('View recent member leave logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'leave-logs',
  description: 'View recent member leave logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('📤 Leave Logs')
      .setDescription('Leave logs are tracked in real-time via the log channel. Configure with `/log-config`.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
