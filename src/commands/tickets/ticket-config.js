import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-config')
    .setDescription('Configure the ticket system')
    .addChannelOption(option =>
      option.setName('log_channel')
        .setDescription('Channel to log ticket activity')
        .setRequired(false)
    )
    .addRoleOption(option =>
      option.setName('support_role')
        .setDescription('Role that can see all tickets')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'ticket-config',
  description: 'Configure the ticket system',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const logChannel = interaction.options.getChannel('log_channel');
    const supportRole = interaction.options.getRole('support_role');

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('⚙️ Ticket System Configuration')
      .addFields(
        { name: '📋 Log Channel', value: logChannel ? `${logChannel}` : 'Not set', inline: true },
        { name: '👥 Support Role', value: supportRole ? `${supportRole}` : 'Not set', inline: true },
      )
      .setFooter({ text: 'Ticket system configured' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
