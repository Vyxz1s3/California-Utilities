import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription("View a user's warnings")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to look up')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'warnings',
  description: "View a user's warnings",

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to view warnings.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM user_warnings WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC',
      [interaction.guild.id, user.id]
    );

    if (result.rows.length === 0) {
      return interaction.reply({ content: `✅ **${user.tag}** has no warnings.`, ephemeral: true });
    }

    const entries = result.rows.map((row, i) => {
      const date = new Date(row.created_at).toLocaleDateString();
      return `**#${i + 1}** ${row.reason} *(${date})*`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle(`⚠️ Warnings — ${user.tag}`)
      .setDescription(entries)
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `${result.rows.length} warning(s) total` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
