import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRandomInt, formatNumber } from '../../utils/helpers.js';
import { getBalance, addToWallet, removeFromWallet, checkEconomyCooldown, setEconomyCooldown } from '../../utils/economy.js';
import { getOrCreateUser } from '../../utils/helpers.js';

const COOLDOWN_SECONDS = 3600; // 1 hour
const FAIL_RATE = 0.50; // 50% fail rate

export default {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Attempt to rob another user (50% fail rate, 1-hour cooldown)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to rob')
        .setRequired(true)
    ),

  name: 'rob',
  description: 'Attempt to rob another user',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const target = interaction.options.getUser('user');

    if (target.id === userId) {
      return interaction.reply({ content: '❌ You cannot rob yourself.', ephemeral: true });
    }
    if (target.bot) {
      return interaction.reply({ content: '❌ You cannot rob a bot.', ephemeral: true });
    }

    const cd = await checkEconomyCooldown(userId, 'rob');
    if (cd.onCooldown) {
      return interaction.reply({ content: `⏰ You need to wait before robbing again! Try again in **${cd.timeLeft}**.`, ephemeral: true });
    }

    const targetData = await getOrCreateUser(target.id);
    if (targetData.balance < 50) {
      return interaction.reply({ content: `❌ **${target.username}** doesn't have enough coins to rob (minimum 50).`, ephemeral: true });
    }

    await setEconomyCooldown(userId, 'rob', COOLDOWN_SECONDS);

    const failed = Math.random() < FAIL_RATE;

    if (failed) {
      const fine = getRandomInt(20, 80);
      const newBalance = await removeFromWallet(userId, fine);
      const balanceText = newBalance === null ? '$0' : `$${formatNumber(newBalance)}`;

      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('🚔 Robbery Failed!')
        .setDescription(`You were caught trying to rob **${target.username}** and paid a fine of **$${formatNumber(fine)}**!`)
        .addFields({ name: '💰 Your Wallet', value: balanceText, inline: true })
        .setFooter({ text: 'Cooldown: 1 hour' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    const pct = getRandomInt(10, 50) / 100;
    const stolen = Math.max(1, Math.floor(targetData.balance * pct));
    await removeFromWallet(target.id, stolen);
    const newBalance = await addToWallet(userId, stolen);

    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('💰 Robbery Successful!')
      .setDescription(`You robbed **${target.username}** and stole **$${formatNumber(stolen)}** (${Math.round(pct * 100)}% of their wallet)!`)
      .addFields({ name: '💰 Your New Wallet', value: `$${formatNumber(newBalance)}`, inline: true })
      .setFooter({ text: 'Cooldown: 1 hour' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
