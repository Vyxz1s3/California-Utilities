import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('edit-reminder')
    .setDescription('Edit an existing reminder')
    .addIntegerOption(o => o.setName('id').setDescription('Reminder ID').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('New reminder message').setRequired(true)),

  name: 'edit-reminder',
  description: 'Edit an existing reminder',

  async execute(interaction, client) {
    const id = interaction.options.getInteger('id');
    const message = interaction.options.getString('message');

    const result = await query(
      'UPDATE reminders SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [message, id, interaction.user.id]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: '❌ Reminder not found or does not belong to you.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('✏️ Reminder Updated')
      .addFields(
        { name: '🆔 ID', value: `${id}`, inline: true },
        { name: '📝 New Message', value: message, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
