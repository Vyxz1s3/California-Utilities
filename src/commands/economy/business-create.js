import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromWallet, unlockAchievement } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const CREATION_COST = 1000;

export default {
  data: new SlashCommandBuilder()
    .setName('business-create')
    .setDescription(`Create your own business (costs $${CREATION_COST})`)
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name of your business')
        .setRequired(true)
        .setMaxLength(50)
    ),

  name: 'business-create',
  description: 'Create a business',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const name = interaction.options.getString('name').trim();

    // Check existing business
    const existing = await query('SELECT id FROM user_businesses WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      return interaction.reply({ content: '❌ You already own a business! Use `/business-info` to view it.', ephemeral: true });
    }

    const { wallet } = await getBalance(userId);
    if (wallet < CREATION_COST) {
      return interaction.reply({ content: `❌ You need **$${formatNumber(CREATION_COST)}** to create a business but only have **$${formatNumber(wallet)}**.`, ephemeral: true });
    }

    await removeFromWallet(userId, CREATION_COST);
    await query(
      'INSERT INTO user_businesses (user_id, name) VALUES ($1, $2)',
      [userId, name]
    );
    await unlockAchievement(userId, 'business_owner');

    const embed = new EmbedBuilder()
      .setColor('#e67e22')
      .setTitle('🏢 Business Created!')
      .setDescription(`Congratulations! **${name}** is now open for business!`)
      .addFields(
        { name: '💰 Cost', value: `$${formatNumber(CREATION_COST)}`, inline: true },
        { name: '📈 Level', value: '1', inline: true },
        { name: '💡 Tip', value: 'Use `/business-upgrade` to grow your business and earn more!', inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
