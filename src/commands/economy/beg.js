import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRandomInt, formatNumber } from '../../utils/helpers.js';
import { addToWallet, checkEconomyCooldown, setEconomyCooldown, checkBalanceAchievements } from '../../utils/economy.js';

const COOLDOWN_SECONDS = 1800; // 30 minutes

const GIVERS = [
  'A kind stranger',
  'A wealthy businessman',
  'A generous grandma',
  'A passing tourist',
  'A local philanthropist',
];

export default {
  data: new SlashCommandBuilder()
    .setName('beg')
    .setDescription('Beg for spare change (30-minute cooldown)'),

  name: 'beg',
  description: 'Beg for spare change (30-minute cooldown)',

  async execute(interaction, client) {
    const userId = interaction.user.id;

    const cd = await checkEconomyCooldown(userId, 'beg');
    if (cd.onCooldown) {
      return interaction.reply({ content: `⏰ People are tired of seeing you! Try again in **${cd.timeLeft}**.`, ephemeral: true });
    }

    const earned = getRandomInt(10, 50);
    const giver = GIVERS[Math.floor(Math.random() * GIVERS.length)];
    const newBalance = await addToWallet(userId, earned);
    await setEconomyCooldown(userId, 'beg', COOLDOWN_SECONDS);
    await checkBalanceAchievements(userId);

    const embed = new EmbedBuilder()
      .setColor('#f39c12')
      .setTitle('🙏 Begging...')
      .setDescription(`${giver} felt sorry for you and gave you **$${formatNumber(earned)}**.`)
      .addFields({ name: '💰 New Wallet Balance', value: `$${formatNumber(newBalance)}`, inline: true })
      .setFooter({ text: 'Cooldown: 30 minutes' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
