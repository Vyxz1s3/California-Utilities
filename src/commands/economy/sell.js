import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { addToWallet, removeItemFromInventory, getItemByName, getUserInventory } from '../../utils/economy.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Sell an item from your inventory back to the shop')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Name of the item to sell')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('How many to sell (default: 1)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  name: 'sell',
  description: 'Sell an item from your inventory',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const itemName = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantity') || 1;

    const item = await getItemByName(itemName);
    if (!item) {
      return interaction.reply({ content: `❌ No item named **${itemName}** exists.`, ephemeral: true });
    }

    if (item.sell_price === 0) {
      return interaction.reply({ content: `❌ **${item.name}** cannot be sold.`, ephemeral: true });
    }

    // Check inventory
    const invRes = await query(
      'SELECT quantity FROM user_inventory WHERE user_id = $1 AND item_id = $2',
      [userId, item.id]
    );
    if (invRes.rows.length === 0 || invRes.rows[0].quantity < quantity) {
      return interaction.reply({ content: `❌ You don't have ${quantity}x **${item.name}** in your inventory.`, ephemeral: true });
    }

    const totalEarned = item.sell_price * quantity;
    await removeItemFromInventory(userId, item.id, quantity);
    const newBalance = await addToWallet(userId, totalEarned);

    const embed = new EmbedBuilder()
      .setColor('#e67e22')
      .setTitle('💰 Sale Successful!')
      .setDescription(`You sold **${quantity}x ${item.emoji} ${item.name}** for **$${formatNumber(totalEarned)}**.`)
      .addFields({ name: '💰 New Wallet Balance', value: `$${formatNumber(newBalance)}`, inline: true })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
