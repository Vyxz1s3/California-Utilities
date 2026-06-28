import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromWallet, addItemToInventory, getItemByName } from '../../utils/economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Name of the item to buy')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('How many to buy (default: 1)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  name: 'buy',
  description: 'Buy an item from the shop',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const itemName = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantity') || 1;

    const item = await getItemByName(itemName);
    if (!item) {
      return interaction.reply({ content: `❌ No item named **${itemName}** found in the shop. Use \`/shop\` to browse.`, ephemeral: true });
    }

    const totalCost = item.price * quantity;
    const { wallet } = await getBalance(userId);

    if (wallet < totalCost) {
      return interaction.reply({
        content: `❌ You need **$${formatNumber(totalCost)}** but only have **$${formatNumber(wallet)}** in your wallet.`,
        ephemeral: true,
      });
    }

    await removeFromWallet(userId, totalCost);
    await addItemToInventory(userId, item.id, quantity);
    const newWallet = wallet - totalCost;

    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('🛒 Purchase Successful!')
      .setDescription(`You bought **${quantity}x ${item.emoji} ${item.name}** for **$${formatNumber(totalCost)}**.`)
      .addFields({ name: '💰 Remaining Wallet', value: `$${formatNumber(newWallet)}`, inline: true })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
