import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getOrCreateMember } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Check your level')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check level for')
        .setRequired(false)
    ),
  
  name: 'level',
  description: 'Check your level',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await getOrCreateMember(interaction.guild.id, user.id);

    const xpPerLevel = 1000;
    const currentLevelXP = (member.level - 1) * xpPerLevel;
    const nextLevelXP = member.level * xpPerLevel;
    const xpInLevel = member.xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    const progress = Math.round((xpInLevel / xpNeeded) * 100);

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle(`${user.username}'s Level`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '📊 Level', value: member.level.toString(), inline: true },
        { name: '⭐ XP', value: `${member.xp} / ${nextLevelXP}`, inline: true },
        { name: '📈 Progress', value: `${progress}%`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

