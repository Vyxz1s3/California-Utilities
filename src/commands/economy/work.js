import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRandomInt, formatNumber } from '../../utils/helpers.js';
import { addToWallet, checkEconomyCooldown, setEconomyCooldown, addGlobalXP, checkBalanceAchievements } from '../../utils/economy.js';

const COOLDOWN_SECONDS = 3600; // 1 hour

const JOBS = [
  'You delivered packages around the city',
  'You worked a shift at the coffee shop',
  'You mowed lawns in the neighbourhood',
  'You fixed computers for local residents',
  'You drove for a rideshare service',
  'You tutored students after school',
  'You stocked shelves at the grocery store',
  'You walked dogs in the park',
];

export default {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work a job and earn coins (1-hour cooldown)'),

  name: 'work',
  description: 'Work a job and earn coins (1-hour cooldown)',

  async execute(interaction, client) {
    const userId = interaction.user.id;

    const cd = await checkEconomyCooldown(userId, 'work');
    if (cd.onCooldown) {
      return interaction.reply({ content: `⏰ You're still tired from your last shift! Try again in **${cd.timeLeft}**.`, ephemeral: true });
    }

    const earned = getRandomInt(50, 200);
    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    const newBalance = await addToWallet(userId, earned);
    await addGlobalXP(userId, 10);
    await setEconomyCooldown(userId, 'work', COOLDOWN_SECONDS);
    await checkBalanceAchievements(userId);

    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('💼 Work Complete!')
      .setDescription(`${job} and earned **$${formatNumber(earned)}**!`)
      .addFields({ name: '💰 New Wallet Balance', value: `$${formatNumber(newBalance)}`, inline: true })
      .setFooter({ text: '+10 XP • Cooldown: 1 hour' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
