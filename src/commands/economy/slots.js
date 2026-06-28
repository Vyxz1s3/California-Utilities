import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromWallet, addToWallet, unlockAchievement } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎'];
const WEIGHTS  = [  30,   25,   20,   15,    8,    2]; // out of 100

function spin() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  const pick = () => {
    let r = Math.random() * total;
    for (let i = 0; i < SYMBOLS.length; i++) {
      r -= WEIGHTS[i];
      if (r <= 0) return SYMBOLS[i];
    }
    return SYMBOLS[0];
  };
  return [pick(), pick(), pick()];
}

function getMultiplier(reels) {
  const [a, b, c] = reels;
  if (a === b && b === c) {
    if (a === '💎') return 20;
    if (a === '⭐') return 10;
    if (a === '🍇') return 5;
    return 3;
  }
  if (a === b || b === c || a === c) return 1.5;
  return 0;
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
    .setName('slots')
    .setDescription('Spin the slot machine!')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Amount to bet (default: 50)')
        .setRequired(false)
        .setMinValue(10)
        .setMaxValue(10000)
    ),

  name: 'slots',
  description: 'Spin the slot machine',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet') || 50;
    const { wallet } = await getBalance(userId);

    if (wallet < bet) {
      return interaction.reply({ content: `❌ You need **$${formatNumber(bet)}** but only have **$${formatNumber(wallet)}**.`, ephemeral: true });
    }

    await removeFromWallet(userId, bet);
    const reels = spin();
    const multiplier = getMultiplier(reels);
    const payout = Math.floor(bet * multiplier);

    if (payout > 0) {
      await addToWallet(userId, payout);
      await trackGambleWin(userId);
    }

    const newBalance = await getBalance(userId).then(b => b.wallet);
    const won = payout > 0;
    const net = payout - bet;

    const embed = new EmbedBuilder()
      .setColor(won ? '#2ecc71' : '#e74c3c')
      .setTitle('🎰 Slot Machine')
      .setDescription(`[ ${reels.join(' | ')} ]`)
      .addFields(
        { name: '📊 Result', value: won ? `${multiplier}x multiplier!` : 'No match — better luck next time!', inline: false },
        { name: '💰 Net', value: net >= 0 ? `+$${formatNumber(net)}` : `-$${formatNumber(Math.abs(net))}`, inline: true },
        { name: '💰 New Balance', value: `$${formatNumber(newBalance)}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
