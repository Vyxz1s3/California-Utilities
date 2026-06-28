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
    .setName('coinflip')
    .setDescription('Flip a coin — bet on heads or tails')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Amount to bet (omit to flip for free)')
        .setRequired(false)
        .setMinValue(10)
        .setMaxValue(10000)
    )
    .addStringOption(option =>
      option.setName('side')
        .setDescription('heads or tails (default: heads)')
        .setRequired(false)
        .addChoices(
          { name: 'Heads', value: 'heads' },
          { name: 'Tails', value: 'tails' }
        )
    ),

  name: 'coinflip',
  description: 'Flip a coin',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const side = (interaction.options.getString('side') || 'heads').toLowerCase();
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const emoji = result === 'heads' ? '🪙' : '🌑';

    // Free flip (no bet)
    if (!bet) {
      return interaction.reply(`${emoji} The coin landed on **${result.charAt(0).toUpperCase() + result.slice(1)}**!`);
    }

    const { wallet } = await getBalance(userId);
    if (wallet < bet) {
      return interaction.reply({ content: `❌ You need **$${formatNumber(bet)}** but only have **$${formatNumber(wallet)}**.`, ephemeral: true });
    }

    const won = result === side;
    await removeFromWallet(userId, bet);
    let payout = 0;
    if (won) {
      payout = bet * 2;
      await addToWallet(userId, payout);
      await trackGambleWin(userId);
    }

    const newBalance = await getBalance(userId).then(b => b.wallet);
    const net = payout - bet;

    const embed = new EmbedBuilder()
      .setColor(won ? '#2ecc71' : '#e74c3c')
      .setTitle(`${emoji} Coin Flip`)
      .setDescription(`The coin landed on **${result.charAt(0).toUpperCase() + result.slice(1)}**!`)
      .addFields(
        { name: '🎯 Your Pick', value: side.charAt(0).toUpperCase() + side.slice(1), inline: true },
        { name: '📊 Result', value: won ? '✅ Win!' : '❌ Loss', inline: true },
        { name: '💰 Net', value: net >= 0 ? `+$${formatNumber(net)}` : `-$${formatNumber(Math.abs(net))}`, inline: true },
        { name: '💰 New Balance', value: `$${formatNumber(newBalance)}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
