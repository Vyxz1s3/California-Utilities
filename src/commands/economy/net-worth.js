import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getNetWorth } from '../../utils/economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('net-worth')
    .setDescription("Check a user's total net worth (wallet + bank + inventory)")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check (defaults to you)')
        .setRequired(false)
    ),

  name: 'net-worth',
  description: "Check a user's total net worth",

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;
    const { wallet, bank, inventoryValue, total } = await getNetWorth(target.id);

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`💎 ${target.username}'s Net Worth`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '💰 Wallet', value: `$${formatNumber(wallet)}`, inline: true },
        { name: '🏦 Bank', value: `$${formatNumber(bank)}`, inline: true },
        { name: '🎒 Inventory', value: `$${formatNumber(inventoryValue)}`, inline: true },
        { name: '💎 Total Net Worth', value: `$${formatNumber(total)}`, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
