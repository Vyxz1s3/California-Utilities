import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('temp-voice-logs')
    .setDescription('View temp voice channel activity logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'temp-voice-logs',
  description: 'View temp voice channel activity logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM temp_voice_channels WHERE guild_id = $1 ORDER BY created_at DESC LIMIT 20',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('📋 Temp Voice Logs')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No temp voice activity found.');
    } else {
      const lines = result.rows.map((c, i) =>
        `**#${i + 1}** — Owner: <@${c.owner_id}> | Created: <t:${Math.floor(new Date(c.created_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
