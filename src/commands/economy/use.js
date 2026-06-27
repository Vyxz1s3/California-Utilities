import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber, getRandomInt } from '../../utils/helpers.js';
import { getItemByName, removeItemFromInventory, addToWallet } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const ITEM_EFFECTS = {
  'potion': async (userId) => {
    const bonus = getRandomInt(50, 150);
    const newBalance = await addToWallet(userId, bonus);
    return `✨ The potion restored your energy! You feel refreshed and gained **$${formatNumber(bonus)}**.`;
  },
  'mystery box': async (userId) => {
    // Give a random common/uncommon item
    const res = await query("SELECT * FROM economy_items WHERE rarity IN ('common','uncommon') ORDER BY RANDOM() LIMIT 1");
    if (res.rows.length > 0) {
      const prize = res.rows[0];
      await query(
        `INSERT INTO user_inventory (user_id, item_id, quantity) VALUES ($1, $2, 1)
         ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = user_inventory.quantity + 1`,
        [userId, prize.id]
      );
      return `📦 You opened the Mystery Box and found: **${prize.emoji} ${prize.name}**!`;
    }
    return '📦 The Mystery Box was empty... how disappointing.';
  },
  'lucky coin': async (userId) => {
    const bonus = getRandomInt(100, 500);
    const newBalance = await addToWallet(userId, bonus);
    return `🍀 The Lucky Coin shimmered and granted you **$${formatNumber(bonus)}** in good fortune!`;
  },
};

export default {
  data: new SlashCommandBuilder()
    .setName('use')
    .setDescription('Use a usable item from your inventory')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Name of the item to use')
        .setRequired(true)
    ),

  name: 'use',
  description: 'Use an item from your inventory',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const itemName = interaction.options.getString('item');

    const item = await getItemByName(itemName);
    if (!item) {
      return interaction.reply({ content: `❌ No item named **${itemName}** found.`, ephemeral: true });
    }
    if (!item.usable) {
      return interaction.reply({ content: `❌ **${item.name}** is not a usable item.`, ephemeral: true });
    }

    const invRes = await query(
      'SELECT quantity FROM user_inventory WHERE user_id = $1 AND item_id = $2',
      [userId, item.id]
    );
    if (invRes.rows.length === 0 || invRes.rows[0].quantity < 1) {
      return interaction.reply({ content: `❌ You don't have any **${item.name}** in your inventory.`, ephemeral: true });
    }

    const effectFn = ITEM_EFFECTS[item.name.toLowerCase()];
    if (!effectFn) {
      return interaction.reply({ content: `❌ **${item.name}** has no effect yet.`, ephemeral: true });
    }

    await removeItemFromInventory(userId, item.id, 1);
    const resultText = await effectFn(userId);

    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle(`${item.emoji} Used: ${item.name}`)
      .setDescription(resultText)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
