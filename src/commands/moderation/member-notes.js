import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('member-notes')
    .setDescription('View notes on a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Member to view notes for')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'member-notes',
  description: 'View notes on a member',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to view member notes.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM member_notes WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC',
      [interaction.guild.id, user.id]
    );

    if (result.rows.length === 0) {
      return interaction.reply({ content: `✅ No notes found for **${user.tag}**.`, ephemeral: true });
    }

    const entries = result.rows.map(row => {
      const date = new Date(row.created_at).toLocaleDateString();
      return `**Note #${row.id}** *(${date} by <@${row.moderator_id}>)*\n> ${row.note}`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(0x1abc9c)
      .setTitle(`📝 Notes — ${user.tag}`)
      .setDescription(entries)
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: `${result.rows.length} note(s)` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
