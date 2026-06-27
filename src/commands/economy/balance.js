import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getOrCreateUser } from '../../utils/helpers.js';
import { formatNumber } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check balance for')
        .setRequired(false)
    ),
  
  name: 'balance',
  description: 'Check your balance',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const userData = await getOrCreateUser(user.id);

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`${user.username}'s Balance`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '💰 Wallet', value: `$${formatNumber(userData.balance)}`, inline: true },
        { name: '🏦 Bank', value: `$${formatNumber(userData.bank)}`, inline: true },
        { name: '💵 Total', value: `$${formatNumber(userData.balance + userData.bank)}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

