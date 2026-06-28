import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromWallet, addToWallet, unlockAchievement } from '../../utils/economy.js';
import { query } from '../../database/db.js';

async function trackGambleWin(userId) {
  await query(
    `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [userId, `gamble_win_${Date.now()}`]
  );
  const res = await query(
    "SELECT COUNT(*) AS cnt FROM user_achievements WHERE user_id = $1 AND achievement_id LIKE 'gamble_win_%'",
    [userId]
  );
  const wins = parseInt(res.rows[0].cnt);
  if (wins >= 10) await unlockAchievement(userId, 'gambler');
  if (wins >= 50) await unlockAchievement(userId, 'lucky');
}

export default {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice — guess the number to win big')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Amount to bet (omit to roll for free)')
        .setRequired(false)
        .setMinValue(10)
        .setMaxValue(10000)
    )
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('Guess the number (1-6) for a 5x payout')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(6)
    )
    .addIntegerOption(option =>
      option.setName('sides')
        .setDescription('Number of sides for a free roll (default: 6)')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(100)
    ),

  name: 'dice',
  description: 'Roll a dice',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const guess = interaction.options.getInteger('number');
    const sides = interaction.options.getInteger('sides') || 6;
    const result = Math.floor(Math.random() * (bet ? 6 : sides)) + 1;

    // Free roll
    if (!bet) {
      return interaction.reply(`🎲 You rolled a **${result}** (1-${sides})`);
    }

    const { wallet } = await getBalance(userId);
    if (wallet < bet) {
      return interaction.reply({ content: `❌ You need **$${formatNumber(bet)}** but only have **$${formatNumber(wallet)}**.`, ephemeral: true });
    }

    await removeFromWallet(userId, bet);

    let won = false;
    let multiplier = 0;
    let resultText = '';

    if (guess) {
      // Exact guess: 5x payout
      won = result === guess;
      multiplier = 5;
      resultText = won ? `🎯 Exact match! You guessed **${guess}** and rolled **${result}**!` : `❌ You guessed **${guess}** but rolled **${result}**.`;
    } else {
      // High/low: roll 4-6 wins 2x
      won = result >= 4;
      multiplier = 2;
      resultText = won ? `🎲 High roll! You rolled **${result}** (4-6 wins).` : `🎲 Low roll. You rolled **${result}** (needed 4-6).`;
    }

    let payout = 0;
    if (won) {
      payout = bet * multiplier;
      await addToWallet(userId, payout);
      await trackGambleWin(userId);
    }

    const newBalance = await getBalance(userId).then(b => b.wallet);
    const net = payout - bet;

    const embed = new EmbedBuilder()
      .setColor(won ? '#2ecc71' : '#e74c3c')
      .setTitle('🎲 Dice Roll')
      .setDescription(resultText)
      .addFields(
        { name: '📊 Result', value: won ? `Win! (${multiplier}x)` : 'Loss', inline: true },
        { name: '💰 Net', value: net >= 0 ? `+$${formatNumber(net)}` : `-$${formatNumber(Math.abs(net))}`, inline: true },
        { name: '💰 New Balance', value: `$${formatNumber(newBalance)}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
