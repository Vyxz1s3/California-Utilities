import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRandomInt, formatNumber } from '../../utils/helpers.js';
import { addToWallet, checkEconomyCooldown, setEconomyCooldown, addGlobalXP, checkBalanceAchievements, unlockAchievement } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const COOLDOWN_SECONDS = 1800; // 30 minutes

const CROPS = [
  { name: 'Wheat',      emoji: '🌾', min: 25,  max: 50  },
  { name: 'Corn',       emoji: '🌽', min: 35,  max: 65  },
  { name: 'Tomatoes',   emoji: '🍅', min: 45,  max: 80  },
  { name: 'Pumpkins',   emoji: '🎃', min: 60,  max: 100 },
  { name: 'Sunflowers', emoji: '🌻', min: 70,  max: 120 },
];

async function checkFarmAchievement(userId) {
  const res = await query(
    "SELECT COUNT(*) AS cnt FROM user_achievements WHERE user_id = $1 AND achievement_id LIKE 'farm_%'",
    [userId]
  );
  const count = parseInt(res.rows[0].cnt) + 1;
  await query(
    `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [userId, `farm_${Date.now()}`]
  );
  if (count >= 50) await unlockAchievement(userId, 'farmer');
}

export default {
  data: new SlashCommandBuilder()
    .setName('farm')
    .setDescription('Tend your farm and harvest crops worth coins (30-min cooldown)'),

  name: 'farm',
  description: 'Farm crops',

  async execute(interaction, client) {
    const userId = interaction.user.id;

    const cd = await checkEconomyCooldown(userId, 'farm');
    if (cd.onCooldown) {
      return interaction.reply({ content: `⏰ Your crops need more time to grow! Try again in **${cd.timeLeft}**.`, ephemeral: true });
    }

    const crop = CROPS[Math.floor(Math.random() * CROPS.length)];
    const earned = getRandomInt(crop.min, crop.max);
    const newBalance = await addToWallet(userId, earned);
    await addGlobalXP(userId, 8);
    await setEconomyCooldown(userId, 'farm', COOLDOWN_SECONDS);
    await checkFarmAchievement(userId);
    await checkBalanceAchievements(userId);

    const embed = new EmbedBuilder()
      .setColor('#27ae60')
      .setTitle('🌾 Harvest Time!')
      .setDescription(`You tended your fields and harvested **${crop.emoji} ${crop.name}** worth **$${formatNumber(earned)}**!`)
      .addFields({ name: '💰 New Wallet Balance', value: `$${formatNumber(newBalance)}`, inline: true })
      .setFooter({ text: '+8 XP • Cooldown: 30 minutes' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
