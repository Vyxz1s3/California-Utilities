import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('message-logs')
    .setDescription('View recent message edit/delete logs')
    .addChannelOption(o => o.setName('channel').setDescription('Filter by channel').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'message-logs',
  description: 'View recent message edit/delete logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('💬 Message Logs')
      .setDescription(`Message logs are tracked in real-time via the log channel. ${channel ? `Filtering for ${channel}.` : ''}\n\nConfigure the log channel with \`/log-config\`.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
