import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ACHIEVEMENTS } from '../../utils/economy.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('achievement-info')
    .setDescription('Get detailed info about a specific achievement')
    .addStringOption(option =>
      option.setName('achievement')
        .setDescription('Achievement ID (e.g. rich, gambler, fisherman)')
        .setRequired(true)
        .addChoices(
          ...Object.values(ACHIEVEMENTS).map(a => ({ name: `${a.emoji} ${a.name}`, value: a.id }))
        )
    ),

  name: 'achievement-info',
  description: 'Get achievement details',

  async execute(interaction, client) {
    const achievementId = interaction.options.getString('achievement');
    const achievement = ACHIEVEMENTS[achievementId];

    if (!achievement) {
      return interaction.reply({ content: '❌ Unknown achievement.', ephemeral: true });
    }

    // Count how many users have unlocked it
    const res = await query(
      'SELECT COUNT(DISTINCT user_id) AS cnt FROM user_achievements WHERE achievement_id = $1',
      [achievementId]
    );
    const holders = parseInt(res.rows[0].cnt);

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`${achievement.emoji} ${achievement.name}`)
      .setDescription(achievement.description)
      .addFields(
        { name: '🆔 ID', value: achievement.id, inline: true },
        { name: '👥 Holders', value: `${holders} user${holders !== 1 ? 's' : ''}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
