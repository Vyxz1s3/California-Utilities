import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('member-info')
    .setDescription('Get detailed information about a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Member to inspect')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'member-info',
  description: 'Get detailed member info',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to view member info.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });

    // Fetch modlog count
    const modlogResult = await query(
      'SELECT COUNT(*) FROM modlogs WHERE guild_id = $1 AND user_id = $2',
      [interaction.guild.id, user.id]
    );
    const warningResult = await query(
      'SELECT COUNT(*) FROM user_warnings WHERE guild_id = $1 AND user_id = $2',
      [interaction.guild.id, user.id]
    );

    const roles = member.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `${r}`)
      .slice(0, 10)
      .join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setColor(member.displayColor || 0x99aab5)
      .setTitle(`👤 Member Info — ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Nickname', value: member.nickname || 'None', inline: true },
        { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: 'Timed Out', value: member.isCommunicationDisabled() ? 'Yes' : 'No', inline: true },
        { name: 'Mod Actions', value: modlogResult.rows[0].count, inline: true },
        { name: 'Warnings', value: warningResult.rows[0].count, inline: true },
        { name: `Roles (${member.roles.cache.size - 1})`, value: roles }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
