import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('richest')
    .setDescription('View the top 10 richest users by total wealth (wallet + bank)'),

  name: 'richest',
  description: 'View the top 10 richest users',

  async execute(interaction, client) {
    const res = await query(
      'SELECT id, balance, bank, (balance + bank) AS total FROM users ORDER BY total DESC LIMIT 10'
    );

    if (res.rows.length === 0) {
      return interaction.reply('💰 No users found.');
    }

    const lines = await Promise.all(res.rows.map(async (row, i) => {
      const user = await client.users.fetch(row.id).catch(() => ({ username: `User ${row.id}` }));
      return `**${i + 1}.** ${user.username} — $${formatNumber(row.total)} (💰 $${formatNumber(row.balance)} + 🏦 $${formatNumber(row.bank)})`;
    }));

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏆 Top 10 Richest Users')
      .setDescription(lines.join('\n'))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
