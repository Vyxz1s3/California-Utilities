import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the server leaderboard'),
  
  name: 'leaderboard',
  description: 'View the server leaderboard',

  async execute(interaction, client) {
    const result = await query(
      'SELECT * FROM members WHERE guild_id = $1 ORDER BY level DESC, xp DESC LIMIT 10',
      [interaction.guild.id]
    );

    if (result.rows.length === 0) {
      return interaction.reply('📊 No members on the leaderboard yet.');
    }

    let leaderboardText = '';
    for (let i = 0; i < result.rows.length; i++) {
      const member = result.rows[i];
      const user = await client.users.fetch(member.user_id);
      leaderboardText += `**${i + 1}.** ${user.username} - Level ${member.level} (${member.xp} XP)\n`;
    }

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📊 Server Leaderboard')
      .setDescription(leaderboardText)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

