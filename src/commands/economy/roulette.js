import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromWallet, addToWallet, unlockAchievement } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const RED_NUMBERS   = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const BLACK_NUMBERS = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];

function spin() {
  return Math.floor(Math.random() * 37); // 0-36
}

function getColour(n) {
  if (n === 0) return 'green';
  return RED_NUMBERS.includes(n) ? 'red' : 'black';
}

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
    .setName('roulette')
    .setDescription('Play roulette — bet on a colour or number')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Amount to bet (default: 50)')
        .setRequired(false)
        .setMinValue(10)
        .setMaxValue(10000)
    )
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('Bet on red, black, green, or a number 0-36 (default: red)')
        .setRequired(false)
    ),

  name: 'roulette',
  description: 'Play roulette',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet') || 50;
    const choiceRaw = (interaction.options.getString('choice') || 'red').toLowerCase().trim();
    const { wallet } = await getBalance(userId);

    if (wallet < bet) {
      return interaction.reply({ content: `❌ You need **$${formatNumber(bet)}** but only have **$${formatNumber(wallet)}**.`, ephemeral: true });
    }

    const result = spin();
    const resultColour = getColour(result);
    const colourEmoji = resultColour === 'red' ? '🔴' : resultColour === 'black' ? '⚫' : '🟢';

    let won = false;
    let multiplier = 0;
    const numChoice = parseInt(choiceRaw, 10);

    if (!isNaN(numChoice) && numChoice >= 0 && numChoice <= 36) {
      // Straight number bet — 35:1
      if (result === numChoice) { won = true; multiplier = 36; }
    } else if (['red', 'black', 'green'].includes(choiceRaw)) {
      if (choiceRaw === 'green') {
        if (resultColour === 'green') { won = true; multiplier = 14; }
      } else {
        if (resultColour === choiceRaw) { won = true; multiplier = 2; }
      }
    } else {
      return interaction.reply({ content: '❌ Invalid choice. Use `red`, `black`, `green`, or a number 0-36.', ephemeral: true });
    }

    await removeFromWallet(userId, bet);
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
      .setTitle('🎡 Roulette')
      .setDescription(`The ball landed on **${colourEmoji} ${result}**!`)
      .addFields(
        { name: '🎯 Your Bet', value: `${choiceRaw} for $${formatNumber(bet)}`, inline: true },
        { name: '📊 Result', value: won ? `Win! (${multiplier}x)` : 'Loss', inline: true },
        { name: '💰 Net', value: net >= 0 ? `+$${formatNumber(net)}` : `-$${formatNumber(Math.abs(net))}`, inline: true },
        { name: '💰 New Balance', value: `$${formatNumber(newBalance)}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
