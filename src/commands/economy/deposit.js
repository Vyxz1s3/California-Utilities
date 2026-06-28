import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromWallet, addToBank } from '../../utils/economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposit coins from your wallet into the bank')
    .addStringOption(option =>
      option.setName('amount')
        .setDescription('Amount to deposit, or "all"')
        .setRequired(true)
    ),

  name: 'deposit',
  description: 'Deposit coins into the bank',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const amountInput = interaction.options.getString('amount').toLowerCase();
    const { wallet } = await getBalance(userId);

    if (wallet <= 0) {
      return interaction.reply({ content: '❌ You have no coins in your wallet to deposit.', ephemeral: true });
    }

    let amount;
    if (amountInput === 'all') {
      amount = wallet;
    } else {
      amount = parseInt(amountInput, 10);
      if (isNaN(amount) || amount <= 0) {
        return interaction.reply({ content: '❌ Please provide a valid positive amount or "all".', ephemeral: true });
      }
    }

    if (amount > wallet) {
      return interaction.reply({ content: `❌ You only have **$${formatNumber(wallet)}** in your wallet.`, ephemeral: true });
    }

    await removeFromWallet(userId, amount);
    const newBank = await addToBank(userId, amount);
    const newWallet = wallet - amount;

    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('🏦 Deposit Successful')
      .addFields(
        { name: '💵 Deposited', value: `$${formatNumber(amount)}`, inline: true },
        { name: '💰 Wallet', value: `$${formatNumber(newWallet)}`, inline: true },
        { name: '🏦 Bank', value: `$${formatNumber(newBank)}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
