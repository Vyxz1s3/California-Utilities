import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { addToWallet } from '../../utils/economy.js';
import { query } from '../../database/db.js';

// Earnings per level per hour (collected on info view)
const EARNINGS_PER_LEVEL = 50;

export default {
  data: new SlashCommandBuilder()
    .setName('business-info')
    .setDescription('View your business info and collect earnings')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User whose business to view (defaults to you)')
        .setRequired(false)
    ),

  name: 'business-info',
  description: 'View business info',

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;
    const isOwn = target.id === interaction.user.id;

    const res = await query('SELECT * FROM user_businesses WHERE user_id = $1', [target.id]);
    if (res.rows.length === 0) {
      const msg = isOwn
        ? "❌ You don't own a business yet. Use `/business-create` to start one!"
        : `❌ **${target.username}** doesn't own a business.`;
      return interaction.reply({ content: msg, ephemeral: true });
    }

    const biz = res.rows[0];
    const hoursSinceCreated = Math.floor((Date.now() - new Date(biz.created_at).getTime()) / 3600000);
    const pendingEarnings = Math.min(hoursSinceCreated * EARNINGS_PER_LEVEL * biz.level, EARNINGS_PER_LEVEL * biz.level * 24);

    let collected = 0;
    if (isOwn && pendingEarnings > 0) {
      collected = pendingEarnings;
      await addToWallet(target.id, collected);
      await query(
        'UPDATE user_businesses SET total_earnings = total_earnings + $1, created_at = NOW() WHERE id = $2',
        [collected, biz.id]
      );
    }

    const embed = new EmbedBuilder()
      .setColor('#e67e22')
      .setTitle(`🏢 ${biz.name}`)
      .addFields(
        { name: '👤 Owner', value: target.username, inline: true },
        { name: '📈 Level', value: `${biz.level}`, inline: true },
        { name: '💵 Earnings/hr', value: `$${formatNumber(EARNINGS_PER_LEVEL * biz.level)}`, inline: true },
        { name: '💰 Total Earned', value: `$${formatNumber(biz.total_earnings)}`, inline: true }
      )
      .setTimestamp();

    if (isOwn && collected > 0) {
      embed.setDescription(`✅ Collected **$${formatNumber(collected)}** in pending earnings!`);
    } else if (isOwn) {
      embed.setDescription('No pending earnings yet. Come back later!');
    }

    await interaction.reply({ embeds: [embed] });
  },
};
