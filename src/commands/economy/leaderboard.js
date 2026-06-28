import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the server leaderboard')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Leaderboard type (default: level)')
        .setRequired(false)
        .addChoices(
          { name: 'Level', value: 'level' },
          { name: 'Balance', value: 'balance' },
          { name: 'Bank', value: 'bank' },
        )
    ),

  name: 'leaderboard',
  description: 'View the server leaderboard',

  async execute(interaction, client) {
    const type = interaction.options.getString('type') || 'level';

    let rows, title, formatRow;

    if (type === 'level') {
      const res = await query(
        'SELECT * FROM members WHERE guild_id = $1 ORDER BY level DESC, xp DESC LIMIT 10',
        [interaction.guild.id]
      );
      rows = res.rows;
      title = '📊 Level Leaderboard';
      formatRow = async (row, i) => {
        const user = await client.users.fetch(row.user_id).catch(() => ({ username: `User ${row.user_id}` }));
        return `**${i + 1}.** ${user.username} — Level ${row.level} (${formatNumber(row.xp)} XP)`;
      };
    } else if (type === 'balance') {
      const res = await query('SELECT * FROM users ORDER BY balance DESC LIMIT 10');
      rows = res.rows;
      title = '💰 Wallet Leaderboard';
      formatRow = async (row, i) => {
        const user = await client.users.fetch(row.id).catch(() => ({ username: `User ${row.id}` }));
        return `**${i + 1}.** ${user.username} — $${formatNumber(row.balance)}`;
      };
    } else {
      const res = await query('SELECT * FROM users ORDER BY bank DESC LIMIT 10');
      rows = res.rows;
      title = '🏦 Bank Leaderboard';
      formatRow = async (row, i) => {
        const user = await client.users.fetch(row.id).catch(() => ({ username: `User ${row.id}` }));
        return `**${i + 1}.** ${user.username} — $${formatNumber(row.bank)}`;
      };
    }

    if (!rows || rows.length === 0) {
      return interaction.reply('📊 No data on the leaderboard yet.');
    }

    const lines = await Promise.all(rows.map((row, i) => formatRow(row, i)));

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(title)
      .setDescription(lines.join('\n'))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
