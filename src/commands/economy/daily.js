import { SlashCommandBuilder } from 'discord.js';
import { addBalance, getOrCreateUser } from '../../utils/helpers.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward'),
  
  name: 'daily',
  description: 'Claim your daily reward',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const dailyAmount = 500;

    // Check if user already claimed today
    const result = await query(
      `SELECT * FROM users WHERE id = $1 AND DATE(updated_at) = CURRENT_DATE`,
      [userId]
    );

    if (result.rows.length > 0) {
      return interaction.reply({
        content: '⏰ You already claimed your daily reward today! Come back tomorrow.',
        ephemeral: true,
      });
    }

    const newBalance = await addBalance(userId, dailyAmount);
    await interaction.reply(`✅ You claimed your daily reward! **+$${dailyAmount}**\nNew balance: **$${newBalance}**`);
  },
};

