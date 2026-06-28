import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove a timeout from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to unmute')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'unmute',
  description: 'Remove a timeout from a user',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to unmute users.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({ content: '❌ That user is not currently muted.', ephemeral: true });
    }

    await member.timeout(null);
    await query(
      'INSERT INTO modlogs (guild_id, user_id, moderator_id, action, reason) VALUES ($1, $2, $3, $4, $5)',
      [interaction.guild.id, user.id, interaction.user.id, 'unmute', 'Timeout removed']
    );

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🔊 User Unmuted')
      .addFields(
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
