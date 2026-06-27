import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getItemByName, RARITY_COLOURS } from '../../utils/economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('item-info')
    .setDescription('Get detailed information about a shop item')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Name of the item')
        .setRequired(true)
    ),

  name: 'item-info',
  description: 'Get detailed information about a shop item',

  async execute(interaction, client) {
    const itemName = interaction.options.getString('item');
    const item = await getItemByName(itemName);

    if (!item) {
      return interaction.reply({ content: `❌ No item named **${itemName}** found. Use \`/shop\` to browse.`, ephemeral: true });
    }

    const colour = RARITY_COLOURS[item.rarity] || '#aaaaaa';

    const embed = new EmbedBuilder()
      .setColor(colour)
      .setTitle(`${item.emoji} ${item.name}`)
      .setDescription(item.description)
      .addFields(
        { name: '💰 Buy Price', value: `$${formatNumber(item.price)}`, inline: true },
        { name: '💵 Sell Price', value: item.sell_price > 0 ? `$${formatNumber(item.sell_price)}` : 'Cannot sell', inline: true },
        { name: '✨ Rarity', value: item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1), inline: true },
        { name: '🔧 Usable', value: item.usable ? 'Yes' : 'No', inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
