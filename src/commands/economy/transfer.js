import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromWallet, addToWallet } from '../../utils/economy.js';
import { getOrCreateUser } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfer coins from your wallet to another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to transfer coins to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to transfer')
        .setRequired(true)
        .setMinValue(1)
    ),

  name: 'transfer',
  description: 'Transfer coins to another user',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (target.id === userId) {
      return interaction.reply({ content: '❌ You cannot transfer coins to yourself.', ephemeral: true });
    }
    if (target.bot) {
      return interaction.reply({ content: '❌ You cannot transfer coins to a bot.', ephemeral: true });
    }

    const { wallet } = await getBalance(userId);
    if (wallet < amount) {
      return interaction.reply({ content: `❌ You only have **$${formatNumber(wallet)}** in your wallet.`, ephemeral: true });
    }

    await getOrCreateUser(target.id);
    await removeFromWallet(userId, amount);
    const targetNewBalance = await addToWallet(target.id, amount);
    const senderNewBalance = wallet - amount;

    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('💸 Transfer Successful')
      .setDescription(`You sent **$${formatNumber(amount)}** to **${target.username}**.`)
      .addFields(
        { name: '💰 Your Wallet', value: `$${formatNumber(senderNewBalance)}`, inline: true },
        { name: `${target.username}'s Wallet`, value: `$${formatNumber(targetNewBalance)}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
