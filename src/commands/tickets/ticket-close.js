import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-close')
    .setDescription('Close the current ticket')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for closing')
        .setRequired(false)
    ),

  name: 'ticket-close',
  description: 'Close the current ticket',

  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const ticket = await query(
      'SELECT * FROM tickets WHERE channel_id = $1 AND status = $2',
      [interaction.channel.id, 'open']
    ).catch(() => ({ rows: [] }));

    if (!ticket.rows.length) {
      return interaction.reply({ content: '❌ This channel is not an open ticket.', ephemeral: true });
    }

    await query(
      'UPDATE tickets SET status = $1, closed_at = NOW() WHERE channel_id = $2',
      ['closed', interaction.channel.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🔒 Ticket Closed')
      .addFields(
        { name: '📋 Reason', value: reason, inline: false },
        { name: '👤 Closed by', value: interaction.user.tag, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
  },
};
