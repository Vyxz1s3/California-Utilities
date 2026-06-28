import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('suggestion-deny')
    .setDescription('Deny a suggestion')
    .addIntegerOption(o => o.setName('id').setDescription('Suggestion ID').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for denial').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'suggestion-deny',
  description: 'Deny a suggestion',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const id = interaction.options.getInteger('id');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const result = await query(
      'UPDATE suggestions SET status = $1, reviewed_by = $2, review_reason = $3, reviewed_at = NOW() WHERE id = $4 AND guild_id = $5 RETURNING *',
      ['denied', interaction.user.id, reason, id, interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: '❌ Suggestion not found.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('❌ Suggestion Denied')
      .addFields(
        { name: '🆔 ID', value: `#${id}`, inline: true },
        { name: '📝 Reason', value: reason, inline: false },
        { name: '💡 Suggestion', value: result.rows[0].content, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
