import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getItemByName, addItemToInventory, removeItemFromInventory } from '../../utils/economy.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('trade')
    .setDescription('Trade an item with another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to trade with')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('your_item')
        .setDescription('Item you are offering')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('their_item')
        .setDescription('Item you want in return')
        .setRequired(true)
    ),

  name: 'trade',
  description: 'Trade an item with another user',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const target = interaction.options.getUser('user');
    const yourItemName = interaction.options.getString('your_item');
    const theirItemName = interaction.options.getString('their_item');

    if (target.id === userId) {
      return interaction.reply({ content: '❌ You cannot trade with yourself.', ephemeral: true });
    }
    if (target.bot) {
      return interaction.reply({ content: '❌ You cannot trade with a bot.', ephemeral: true });
    }

    const yourItem = await getItemByName(yourItemName);
    if (!yourItem) {
      return interaction.reply({ content: `❌ Item **${yourItemName}** does not exist.`, ephemeral: true });
    }

    const theirItem = await getItemByName(theirItemName);
    if (!theirItem) {
      return interaction.reply({ content: `❌ Item **${theirItemName}** does not exist.`, ephemeral: true });
    }

    // Check sender has their item
    const senderInv = await query(
      'SELECT quantity FROM user_inventory WHERE user_id = $1 AND item_id = $2',
      [userId, yourItem.id]
    );
    if (senderInv.rows.length === 0 || senderInv.rows[0].quantity < 1) {
      return interaction.reply({ content: `❌ You don't have **${yourItem.name}** in your inventory.`, ephemeral: true });
    }

    // Check target has their item
    const targetInv = await query(
      'SELECT quantity FROM user_inventory WHERE user_id = $1 AND item_id = $2',
      [target.id, theirItem.id]
    );
    if (targetInv.rows.length === 0 || targetInv.rows[0].quantity < 1) {
      return interaction.reply({ content: `❌ **${target.username}** doesn't have **${theirItem.name}** in their inventory.`, ephemeral: true });
    }

    // Execute trade
    await removeItemFromInventory(userId, yourItem.id, 1);
    await removeItemFromInventory(target.id, theirItem.id, 1);
    await addItemToInventory(userId, theirItem.id, 1);
    await addItemToInventory(target.id, yourItem.id, 1);

    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('🤝 Trade Complete!')
      .setDescription(
        `**${interaction.user.username}** gave ${yourItem.emoji} **${yourItem.name}**\n` +
        `**${target.username}** gave ${theirItem.emoji} **${theirItem.name}**`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
