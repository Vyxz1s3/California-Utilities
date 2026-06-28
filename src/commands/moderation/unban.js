import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .addStringOption(option =>
      option.setName('user_id')
        .setDescription('ID of the user to unban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unban')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  name: 'unban',
  description: 'Unban a user from the server',

  async execute(interaction, client) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to unban users.', ephemeral: true });
    }

    const bans = await interaction.guild.bans.fetch();
    const ban = bans.get(userId);
    if (!ban) {
      return interaction.reply({ content: '❌ That user is not banned.', ephemeral: true });
    }

    await interaction.guild.members.unban(userId, reason);
    await query(
      'INSERT INTO modlogs (guild_id, user_id, moderator_id, action, reason) VALUES ($1, $2, $3, $4, $5)',
      [interaction.guild.id, userId, interaction.user.id, 'unban', reason]
    );

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('✅ User Unbanned')
      .addFields(
        { name: 'User', value: `${ban.user.tag} (${userId})`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Reason', value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
