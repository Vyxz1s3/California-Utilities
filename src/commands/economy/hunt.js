import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRandomInt, formatNumber } from '../../utils/helpers.js';
import { addToWallet, checkEconomyCooldown, setEconomyCooldown, addGlobalXP, checkBalanceAchievements } from '../../utils/economy.js';

const COOLDOWN_SECONDS = 1800; // 30 minutes

const ANIMALS = [
  { name: 'Rabbit',  emoji: '🐇', min: 40,  max: 80  },
  { name: 'Deer',    emoji: '🦌', min: 60,  max: 110 },
  { name: 'Boar',    emoji: '🐗', min: 80,  max: 140 },
  { name: 'Wolf',    emoji: '🐺', min: 100, max: 160 },
  { name: 'Bear',    emoji: '🐻', min: 120, max: 180 },
];

export default {
  data: new SlashCommandBuilder()
    .setName('hunt')
    .setDescription('Go hunting and sell your catch for coins (30-min cooldown)'),

  name: 'hunt',
  description: 'Go hunting',

  async execute(interaction, client) {
    const userId = interaction.user.id;

    const cd = await checkEconomyCooldown(userId, 'hunt');
    if (cd.onCooldown) {
      return interaction.reply({ content: `⏰ The forest is quiet right now! Try again in **${cd.timeLeft}**.`, ephemeral: true });
    }

    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const earned = getRandomInt(animal.min, animal.max);
    const newBalance = await addToWallet(userId, earned);
    await addGlobalXP(userId, 12);
    await setEconomyCooldown(userId, 'hunt', COOLDOWN_SECONDS);
    await checkBalanceAchievements(userId);

    const embed = new EmbedBuilder()
      .setColor('#8e44ad')
      .setTitle('🏹 Hunt Successful!')
      .setDescription(`You tracked and hunted a **${animal.emoji} ${animal.name}** and sold it for **$${formatNumber(earned)}**!`)
      .addFields({ name: '💰 New Wallet Balance', value: `$${formatNumber(newBalance)}`, inline: true })
      .setFooter({ text: '+12 XP • Cooldown: 30 minutes' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
