import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromWallet, addToWallet, unlockAchievement } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function buildDeck() {
  const deck = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ suit, rank });
  return deck.sort(() => Math.random() - 0.5);
}

function cardValue(rank) {
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank);
}

function handValue(hand) {
  let total = hand.reduce((s, c) => s + cardValue(c.rank), 0);
  let aces = hand.filter(c => c.rank === 'A').length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function formatHand(hand) {
  return hand.map(c => `${c.rank}${c.suit}`).join(' ');
}

async function trackGambleWin(userId) {
  // Count wins stored in achievements table as a proxy counter
  const res = await query(
    "SELECT COUNT(*) AS cnt FROM user_achievements WHERE user_id = $1 AND achievement_id LIKE 'gamble_win_%'",
    [userId]
  );
  const wins = parseInt(res.rows[0].cnt) + 1;
  await query(
    `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [userId, `gamble_win_${Date.now()}`]
  );
  if (wins >= 10) await unlockAchievement(userId, 'gambler');
  if (wins >= 50) await unlockAchievement(userId, 'lucky');
}

export default {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Play a game of blackjack')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Amount to bet (default: 50)')
        .setRequired(false)
        .setMinValue(10)
        .setMaxValue(10000)
    ),

  name: 'blackjack',
  description: 'Play blackjack',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet') || 50;
    const { wallet } = await getBalance(userId);

    if (wallet < bet) {
      return interaction.reply({ content: `❌ You need **$${formatNumber(bet)}** to bet but only have **$${formatNumber(wallet)}**.`, ephemeral: true });
    }

    await removeFromWallet(userId, bet);

    const deck = buildDeck();
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];

    const playerTotal = handValue(playerHand);
    const dealerTotal = handValue(dealerHand);

    // Simplified: one round, no hit/stand interaction
    // Player stands on 17+, hits below 17
    let pHand = [...playerHand];
    while (handValue(pHand) < 17) pHand.push(deck.pop());

    let dHand = [...dealerHand];
    while (handValue(dHand) < 17) dHand.push(deck.pop());

    const pFinal = handValue(pHand);
    const dFinal = handValue(dHand);

    let result, colour, payout;
    if (pFinal > 21) {
      result = '💥 Bust! You went over 21.';
      colour = '#e74c3c';
      payout = 0;
    } else if (dFinal > 21 || pFinal > dFinal) {
      result = '🎉 You win!';
      colour = '#2ecc71';
      payout = bet * 2;
      await trackGambleWin(userId);
    } else if (pFinal === dFinal) {
      result = '🤝 Push! It\'s a tie.';
      colour = '#f39c12';
      payout = bet; // return bet
    } else {
      result = '😔 Dealer wins.';
      colour = '#e74c3c';
      payout = 0;
    }

    if (payout > 0) await addToWallet(userId, payout);
    const newBalance = await getBalance(userId).then(b => b.wallet);

    const embed = new EmbedBuilder()
      .setColor(colour)
      .setTitle('🃏 Blackjack')
      .addFields(
        { name: '🧑 Your Hand', value: `${formatHand(pHand)} (${pFinal})`, inline: true },
        { name: '🤖 Dealer Hand', value: `${formatHand(dHand)} (${dFinal})`, inline: true },
        { name: '📊 Result', value: result, inline: false },
        { name: '💰 Payout', value: payout > 0 ? `+$${formatNumber(payout)}` : `-$${formatNumber(bet)}`, inline: true },
        { name: '💰 New Balance', value: `$${formatNumber(newBalance)}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
