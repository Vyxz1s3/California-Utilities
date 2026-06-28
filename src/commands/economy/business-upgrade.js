import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromWallet } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const MAX_LEVEL = 10;

function upgradeCost(currentLevel) {
  return currentLevel * 500;
}

export default {
  data: new SlashCommandBuilder()
    .setName('business-upgrade')
    .setDescription('Upgrade your business to increase hourly earnings'),

  name: 'business-upgrade',
  description: 'Upgrade your business',

  async execute(interaction, client) {
    const userId = interaction.user.id;

    const res = await query('SELECT * FROM user_businesses WHERE user_id = $1', [userId]);
    if (res.rows.length === 0) {
      return interaction.reply({ content: "❌ You don't own a business. Use `/business-create` first!", ephemeral: true });
    }

    const biz = res.rows[0];
    if (biz.level >= MAX_LEVEL) {
      return interaction.reply({ content: `❌ Your business is already at the maximum level (${MAX_LEVEL})!`, ephemeral: true });
    }

    const cost = upgradeCost(biz.level);
    const { wallet } = await getBalance(userId);

    if (wallet < cost) {
      return interaction.reply({ content: `❌ Upgrading to level ${biz.level + 1} costs **$${formatNumber(cost)}** but you only have **$${formatNumber(wallet)}**.`, ephemeral: true });
    }

    await removeFromWallet(userId, cost);
    await query('UPDATE user_businesses SET level = level + 1 WHERE id = $1', [biz.id]);
    const newLevel = biz.level + 1;

    const embed = new EmbedBuilder()
      .setColor('#e67e22')
      .setTitle('📈 Business Upgraded!')
      .setDescription(`**${biz.name}** has been upgraded to **Level ${newLevel}**!`)
      .addFields(
        { name: '💰 Cost', value: `$${formatNumber(cost)}`, inline: true },
        { name: '📈 New Level', value: `${newLevel}`, inline: true },
        { name: '💵 New Earnings/hr', value: `$${formatNumber(newLevel * 50)}`, inline: true },
        { name: '⬆️ Next Upgrade', value: newLevel < MAX_LEVEL ? `$${formatNumber(upgradeCost(newLevel))}` : 'MAX LEVEL', inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
