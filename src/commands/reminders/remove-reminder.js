import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remove-reminder')
    .setDescription('Remove a reminder by ID')
    .addIntegerOption(o => o.setName('id').setDescription('Reminder ID (from /reminders)').setRequired(true)),

  name: 'remove-reminder',
  description: 'Remove a reminder by ID',

  async execute(interaction, client) {
    const id = interaction.options.getInteger('id');

    const result = await query(
      'DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, interaction.user.id]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: '❌ Reminder not found or does not belong to you.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🗑️ Reminder Removed')
      .setDescription(`Reminder **#${id}** has been removed.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
