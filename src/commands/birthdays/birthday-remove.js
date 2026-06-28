import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('birthday-remove')
    .setDescription('Remove your birthday from the bot'),

  name: 'birthday-remove',
  description: 'Remove your birthday from the bot',

  async execute(interaction, client) {
    await query(
      'DELETE FROM birthdays WHERE guild_id = $1 AND user_id = $2',
      [interaction.guild.id, interaction.user.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🗑️ Birthday Removed')
      .setDescription('Your birthday has been removed.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
