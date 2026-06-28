import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

function parseDuration(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
}

export default {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute (timeout) a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to mute')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g. 10m, 1h, 7d — max 28d)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for mute')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'mute',
  description: 'Mute (timeout) a user',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to mute users.', ephemeral: true });
    }

    const durationMs = parseDuration(durationStr);
    if (!durationMs) {
      return interaction.reply({ content: '❌ Invalid duration. Use formats like `10m`, `1h`, `7d`.', ephemeral: true });
    }

    const maxDuration = 28 * 24 * 60 * 60 * 1000;
    if (durationMs > maxDuration) {
      return interaction.reply({ content: '❌ Duration cannot exceed 28 days.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: '❌ I cannot mute this user.', ephemeral: true });

    await member.timeout(durationMs, reason);
    await query(
      'INSERT INTO modlogs (guild_id, user_id, moderator_id, action, reason) VALUES ($1, $2, $3, $4, $5)',
      [interaction.guild.id, user.id, interaction.user.id, 'mute', reason]
    );

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle('🔇 User Muted')
      .addFields(
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Duration', value: durationStr, inline: true },
        { name: 'Reason', value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
