import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getUserInventory } from '../../utils/economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription("View a user's inventory")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check (defaults to you)')
        .setRequired(false)
    ),

  name: 'inventory',
  description: "View a user's inventory",

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;
    const items = await getUserInventory(target.id);

    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle(`🎒 ${target.username}'s Inventory`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    if (items.length === 0) {
      embed.setDescription('This inventory is empty. Use `/shop` to buy items!');
    } else {
      const lines = items.map(i => `${i.emoji} **${i.name}** x${i.quantity} — worth $${formatNumber(i.sell_price * i.quantity)}`);
      embed.setDescription(lines.join('\n'));
    }

    await interaction.reply({ embeds: [embed] });
  },
};
