import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('birthday-logs')
    .setDescription('View birthday announcement logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'birthday-logs',
  description: 'View birthday announcement logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM birthdays WHERE guild_id = $1 ORDER BY created_at DESC LIMIT 20',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xFF69B4)
      .setTitle('📋 Birthday Logs')
      .setDescription(result.rows.length
        ? `${result.rows.length} birthdays registered in this server.`
        : 'No birthdays registered.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
