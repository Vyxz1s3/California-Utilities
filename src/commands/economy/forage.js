import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRandomInt, formatNumber } from '../../utils/helpers.js';
import { addToWallet, checkEconomyCooldown, setEconomyCooldown, addGlobalXP, checkBalanceAchievements } from '../../utils/economy.js';

const COOLDOWN_SECONDS = 1800; // 30 minutes

const FINDS = [
  { name: 'Wild Berries',   emoji: '🫐', min: 15, max: 35 },
  { name: 'Mushrooms',      emoji: '🍄', min: 20, max: 45 },
  { name: 'Herbs',          emoji: '🌿', min: 25, max: 55 },
  { name: 'Rare Flowers',   emoji: '🌸', min: 35, max: 70 },
  { name: 'Ancient Roots',  emoji: '🪵', min: 50, max: 80 },
];

export default {
  data: new SlashCommandBuilder()
    .setName('forage')
    .setDescription('Forage the wilderness for items worth coins (30-min cooldown)'),

  name: 'forage',
  description: 'Forage for items',

  async execute(interaction, client) {
    const userId = interaction.user.id;

    const cd = await checkEconomyCooldown(userId, 'forage');
    if (cd.onCooldown) {
      return interaction.reply({ content: `⏰ You've already scoured the area! Try again in **${cd.timeLeft}**.`, ephemeral: true });
    }

    const find = FINDS[Math.floor(Math.random() * FINDS.length)];
    const earned = getRandomInt(find.min, find.max);
    const newBalance = await addToWallet(userId, earned);
    await addGlobalXP(userId, 6);
    await setEconomyCooldown(userId, 'forage', COOLDOWN_SECONDS);
    await checkBalanceAchievements(userId);

    const embed = new EmbedBuilder()
      .setColor('#16a085')
      .setTitle('🌿 Foraging Complete!')
      .setDescription(`You explored the wilderness and found **${find.emoji} ${find.name}** worth **$${formatNumber(earned)}**!`)
      .addFields({ name: '💰 New Wallet Balance', value: `$${formatNumber(newBalance)}`, inline: true })
      .setFooter({ text: '+6 XP • Cooldown: 30 minutes' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
