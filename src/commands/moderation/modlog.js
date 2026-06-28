import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('modlog')
    .setDescription("View a user's moderation history")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to look up')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'modlog',
  description: "View a user's moderation history",

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to view mod logs.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM modlogs WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 20',
      [interaction.guild.id, user.id]
    );

    if (result.rows.length === 0) {
      return interaction.reply({ content: `✅ No moderation history found for **${user.tag}**.`, ephemeral: true });
    }

    const entries = result.rows.map((row, i) => {
      const date = new Date(row.created_at).toLocaleDateString();
      return `**#${i + 1}** \`${row.action.toUpperCase()}\` — ${row.reason} *(${date})*`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`📋 Mod Log — ${user.tag}`)
      .setDescription(entries)
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `${result.rows.length} record(s) found` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
