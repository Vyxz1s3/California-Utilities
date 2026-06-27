import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRandomInt, formatNumber } from '../../utils/helpers.js';
import { addToWallet, checkEconomyCooldown, setEconomyCooldown, addGlobalXP, checkBalanceAchievements, unlockAchievement } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const COOLDOWN_SECONDS = 1800; // 30 minutes

const CATCHES = [
  { name: 'Tiny Minnow',    emoji: '🐟', min: 20,  max: 40  },
  { name: 'Bass',           emoji: '🐠', min: 40,  max: 70  },
  { name: 'Salmon',         emoji: '🐡', min: 60,  max: 90  },
  { name: 'Tuna',           emoji: '🦈', min: 80,  max: 100 },
  { name: 'Golden Fish',    emoji: '✨', min: 90,  max: 150 },
];

async function checkFishAchievement(userId) {
  const res = await query(
    "SELECT COUNT(*) AS cnt FROM user_achievements WHERE user_id = $1 AND achievement_id LIKE 'fish_%'",
    [userId]
  );
  const count = parseInt(res.rows[0].cnt) + 1;
  await query(
    `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [userId, `fish_${Date.now()}`]
  );
  if (count >= 50) await unlockAchievement(userId, 'fisherman');
}

export default {
  data: new SlashCommandBuilder()
    .setName('fish')
    .setDescription('Go fishing and catch fish worth coins (30-min cooldown)'),

  name: 'fish',
  description: 'Go fishing',

  async execute(interaction, client) {
    const userId = interaction.user.id;

    const cd = await checkEconomyCooldown(userId, 'fish');
    if (cd.onCooldown) {
      return interaction.reply({ content: `⏰ The fish aren't biting yet! Try again in **${cd.timeLeft}**.`, ephemeral: true });
    }

    const catch_ = CATCHES[Math.floor(Math.random() * CATCHES.length)];
    const earned = getRandomInt(catch_.min, catch_.max);
    const newBalance = await addToWallet(userId, earned);
    await addGlobalXP(userId, 8);
    await setEconomyCooldown(userId, 'fish', COOLDOWN_SECONDS);
    await checkFishAchievement(userId);
    await checkBalanceAchievements(userId);

    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('🎣 Gone Fishing!')
      .setDescription(`You cast your line and caught a **${catch_.emoji} ${catch_.name}** worth **$${formatNumber(earned)}**!`)
      .addFields({ name: '💰 New Wallet Balance', value: `$${formatNumber(newBalance)}`, inline: true })
      .setFooter({ text: '+8 XP • Cooldown: 30 minutes' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
