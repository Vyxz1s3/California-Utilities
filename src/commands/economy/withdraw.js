import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromBank, addToWallet } from '../../utils/economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Withdraw coins from your bank to your wallet')
    .addStringOption(option =>
      option.setName('amount')
        .setDescription('Amount to withdraw, or "all"')
        .setRequired(true)
    ),

  name: 'withdraw',
  description: 'Withdraw coins from the bank',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const amountInput = interaction.options.getString('amount').toLowerCase();
    const { bank } = await getBalance(userId);

    if (bank <= 0) {
      return interaction.reply({ content: '❌ You have no coins in your bank to withdraw.', ephemeral: true });
    }

    let amount;
    if (amountInput === 'all') {
      amount = bank;
    } else {
      amount = parseInt(amountInput, 10);
      if (isNaN(amount) || amount <= 0) {
        return interaction.reply({ content: '❌ Please provide a valid positive amount or "all".', ephemeral: true });
      }
    }

    if (amount > bank) {
      return interaction.reply({ content: `❌ You only have **$${formatNumber(bank)}** in your bank.`, ephemeral: true });
    }

    await removeFromBank(userId, amount);
    const newWallet = await addToWallet(userId, amount);
    const newBank = bank - amount;

    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('🏦 Withdrawal Successful')
      .addFields(
        { name: '💵 Withdrawn', value: `$${formatNumber(amount)}`, inline: true },
        { name: '💰 Wallet', value: `$${formatNumber(newWallet)}`, inline: true },
        { name: '🏦 Bank', value: `$${formatNumber(newBank)}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
