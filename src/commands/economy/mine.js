import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRandomInt, formatNumber } from '../../utils/helpers.js';
import { addToWallet, checkEconomyCooldown, setEconomyCooldown, addGlobalXP, checkBalanceAchievements, unlockAchievement } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const COOLDOWN_SECONDS = 1800; // 30 minutes

const ORES = [
  { name: 'Coal',     emoji: '🪨', min: 30,  max: 60  },
  { name: 'Iron Ore', emoji: '⚙️', min: 50,  max: 90  },
  { name: 'Gold Ore', emoji: '🥇', min: 80,  max: 120 },
  { name: 'Diamond',  emoji: '💎', min: 100, max: 150 },
  { name: 'Emerald',  emoji: '💚', min: 120, max: 180 },
];

async function checkMineAchievement(userId) {
  const res = await query(
    "SELECT COUNT(*) AS cnt FROM user_achievements WHERE user_id = $1 AND achievement_id LIKE 'mine_%'",
    [userId]
  );
  const count = parseInt(res.rows[0].cnt) + 1;
  await query(
    `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [userId, `mine_${Date.now()}`]
  );
  if (count >= 50) await unlockAchievement(userId, 'miner');
}

export default {
  data: new SlashCommandBuilder()
    .setName('mine')
    .setDescription('Go mining and dig up ore worth coins (30-min cooldown)'),

  name: 'mine',
  description: 'Go mining',

  async execute(interaction, client) {
    const userId = interaction.user.id;

    const cd = await checkEconomyCooldown(userId, 'mine');
    if (cd.onCooldown) {
      return interaction.reply({ content: `⏰ Your pickaxe needs sharpening! Try again in **${cd.timeLeft}**.`, ephemeral: true });
    }

    const ore = ORES[Math.floor(Math.random() * ORES.length)];
    const earned = getRandomInt(ore.min, ore.max);
    const newBalance = await addToWallet(userId, earned);
    await addGlobalXP(userId, 10);
    await setEconomyCooldown(userId, 'mine', COOLDOWN_SECONDS);
    await checkMineAchievement(userId);
    await checkBalanceAchievements(userId);

    const embed = new EmbedBuilder()
      .setColor('#7f8c8d')
      .setTitle('⛏️ Mining Complete!')
      .setDescription(`You ventured deep underground and mined **${ore.emoji} ${ore.name}** worth **$${formatNumber(earned)}**!`)
      .addFields({ name: '💰 New Wallet Balance', value: `$${formatNumber(newBalance)}`, inline: true })
      .setFooter({ text: '+10 XP • Cooldown: 30 minutes' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
