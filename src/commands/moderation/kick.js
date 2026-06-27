import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to kick')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kick')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  
  name: 'kick',
  description: 'Kick a user from the server',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id);

    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({
        content: '❌ You do not have permission to kick users.',
        ephemeral: true,
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content: '❌ I cannot kick this user.',
        ephemeral: true,
      });
    }

    await member.kick(reason);
    await query(
      'INSERT INTO modlogs (guild_id, user_id, moderator_id, action, reason) VALUES ($1, $2, $3, $4, $5)',
      [interaction.guild.id, user.id, interaction.user.id, 'kick', reason]
    );

    await interaction.reply(`👢 **${user.username}** has been kicked.\n**Reason:** ${reason}`);
  },
};

