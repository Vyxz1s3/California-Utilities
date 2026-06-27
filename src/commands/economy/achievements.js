import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserAchievements, ACHIEVEMENTS } from '../../utils/economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('achievements')
    .setDescription("View a user's unlocked achievements")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check (defaults to you)')
        .setRequired(false)
    ),

  name: 'achievements',
  description: "View achievements",

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;
    const unlocked = await getUserAchievements(target.id);
    const unlockedIds = new Set(unlocked.map(a => a.achievement_id));

    const allAchievements = Object.values(ACHIEVEMENTS);
    const lines = allAchievements.map(a => {
      const done = unlockedIds.has(a.id);
      return `${done ? '✅' : '🔒'} ${a.emoji} **${a.name}** — ${a.description}`;
    });

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🏆 ${target.username}'s Achievements`)
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setDescription(lines.join('\n'))
      .setFooter({ text: `${unlockedIds.size}/${allAchievements.length} unlocked` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
