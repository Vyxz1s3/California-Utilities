import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('suggestions')
    .setDescription('View suggestions for this server')
    .addStringOption(o =>
      o.setName('status')
        .setDescription('Filter by status')
        .setRequired(false)
        .addChoices(
          { name: '⏳ Pending', value: 'pending' },
          { name: '✅ Approved', value: 'approved' },
          { name: '❌ Denied', value: 'denied' },
        )
    ),

  name: 'suggestions',
  description: 'View suggestions for this server',

  async execute(interaction, client) {
    const status = interaction.options.getString('status') || 'pending';

    const result = await query(
      'SELECT * FROM suggestions WHERE guild_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 10',
      [interaction.guild.id, status]
    ).catch(() => ({ rows: [] }));

    const statusEmoji = { pending: '⏳', approved: '✅', denied: '❌' };

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`💡 Suggestions — ${statusEmoji[status]} ${status.charAt(0).toUpperCase() + status.slice(1)}`)
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription(`No ${status} suggestions found.`);
    } else {
      const lines = result.rows.map(s =>
        `**#${s.id}** — ${s.content.slice(0, 80)}${s.content.length > 80 ? '...' : ''}\n👤 <@${s.user_id}>`
      ).join('\n\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
