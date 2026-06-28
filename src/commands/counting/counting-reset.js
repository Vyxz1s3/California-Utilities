import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('counting-reset')
    .setDescription('Reset the counting channel back to 0')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'counting-reset',
  description: 'Reset the counting channel back to 0',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    await query(
      'UPDATE counting_channel_data SET current_count = 0, last_user_id = NULL WHERE guild_id = $1',
      [interaction.guild.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🔄 Counting Reset')
      .setDescription('The counting channel has been reset to **0**. Start again from **1**!')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
