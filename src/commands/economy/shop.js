import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { RARITY_COLOURS } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'special', 'legendary'];

export default {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Browse the item shop'),

  name: 'shop',
  description: 'Browse the item shop',

  async execute(interaction, client) {
    const res = await query('SELECT * FROM economy_items ORDER BY price ASC');
    const items = res.rows;

    if (items.length === 0) {
      return interaction.reply({ content: '🛒 The shop is empty right now.', ephemeral: true });
    }

    // Group by rarity
    const grouped = {};
    for (const item of items) {
      if (!grouped[item.rarity]) grouped[item.rarity] = [];
      grouped[item.rarity].push(item);
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🛒 Item Shop')
      .setDescription('Use `/buy <item>` to purchase an item.\nUse `/item-info <item>` for details.')
      .setTimestamp();

    for (const rarity of RARITY_ORDER) {
      if (!grouped[rarity]) continue;
      const lines = grouped[rarity].map(i =>
        `${i.emoji} **${i.name}** — $${formatNumber(i.price)} (sell: $${formatNumber(i.sell_price)})`
      ).join('\n');
      embed.addFields({ name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`, value: lines });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
