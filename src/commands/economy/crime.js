import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRandomInt, formatNumber } from '../../utils/helpers.js';
import { addToWallet, removeFromWallet, checkEconomyCooldown, setEconomyCooldown, addGlobalXP, checkBalanceAchievements } from '../../utils/economy.js';

const COOLDOWN_SECONDS = 7200; // 2 hours
const FAIL_RATE = 0.40; // 40% chance of failure

const SUCCESS_CRIMES = [
  'You pickpocketed a wealthy tourist',
  'You hacked into a corporate database and swiped funds',
  'You ran a successful con on a street corner',
  'You forged some documents and sold them',
  'You smuggled contraband across the border',
];

const FAIL_CRIMES = [
  'You got caught pickpocketing and paid a fine',
  'The security system caught you red-handed',
  'Your con fell apart and you had to pay damages',
  'The police spotted you and you bribed your way out',
  'You tripped the alarm and had to pay a penalty',
];

export default {
  data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Commit a crime for big money — but risk losing coins (2-hour cooldown)'),

  name: 'crime',
  description: 'Commit a crime for big money — but risk losing coins (2-hour cooldown)',

  async execute(interaction, client) {
    const userId = interaction.user.id;

    const cd = await checkEconomyCooldown(userId, 'crime');
    if (cd.onCooldown) {
      return interaction.reply({ content: `⏰ You need to lay low for a bit! Try again in **${cd.timeLeft}**.`, ephemeral: true });
    }

    await setEconomyCooldown(userId, 'crime', COOLDOWN_SECONDS);

    const failed = Math.random() < FAIL_RATE;

    if (failed) {
      const fine = getRandomInt(20, 100);
      const desc = FAIL_CRIMES[Math.floor(Math.random() * FAIL_CRIMES.length)];
      const newBalance = await removeFromWallet(userId, fine);
      const balanceText = newBalance === null ? '$0 (insufficient funds)' : `$${formatNumber(newBalance)}`;

      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('🚔 Crime Failed!')
        .setDescription(`${desc}. You paid a fine of **$${formatNumber(fine)}**.`)
        .addFields({ name: '💰 New Wallet Balance', value: balanceText, inline: true })
        .setFooter({ text: 'Cooldown: 2 hours' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    const earned = getRandomInt(30, 300);
    const desc = SUCCESS_CRIMES[Math.floor(Math.random() * SUCCESS_CRIMES.length)];
    const newBalance = await addToWallet(userId, earned);
    await addGlobalXP(userId, 20);
    await checkBalanceAchievements(userId);

    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('🦹 Crime Successful!')
      .setDescription(`${desc} and got away with **$${formatNumber(earned)}**!`)
      .addFields({ name: '💰 New Wallet Balance', value: `$${formatNumber(newBalance)}`, inline: true })
      .setFooter({ text: '+20 XP • Cooldown: 2 hours' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
