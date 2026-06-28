import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('confession-deny')
    .setDescription('Deny a confession')
    .addIntegerOption(o => o.setName('id').setDescription('Confession ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'confession-deny',
  description: 'Deny a confession',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const id = interaction.options.getInteger('id');

    const result = await query(
      'UPDATE confessions SET status = $1, reviewed_by = $2, reviewed_at = NOW() WHERE id = $3 AND guild_id = $4 RETURNING *',
      ['denied', interaction.user.id, id, interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: '❌ Confession not found.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('❌ Confession Denied')
      .addFields({ name: '🆔 ID', value: `#${id}`, inline: true })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
