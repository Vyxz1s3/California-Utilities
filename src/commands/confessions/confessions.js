import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('confessions')
    .setDescription('View approved confessions')
    .addStringOption(o =>
      o.setName('status')
        .setDescription('Filter by status (mods only for pending/denied)')
        .setRequired(false)
        .addChoices(
          { name: '✅ Approved', value: 'approved' },
          { name: '⏳ Pending', value: 'pending' },
        )
    ),

  name: 'confessions',
  description: 'View approved confessions',

  async execute(interaction, client) {
    const status = interaction.options.getString('status') || 'approved';

    if (status === 'pending' && !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission to view pending confessions.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM confessions WHERE guild_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 10',
      [interaction.guild.id, status]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle(`🤫 Confessions — ${status.charAt(0).toUpperCase() + status.slice(1)}`)
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription(`No ${status} confessions found.`);
    } else {
      const lines = result.rows.map((c, i) =>
        `**#${c.id}** — ${c.content.slice(0, 100)}${c.content.length > 100 ? '...' : ''}`
      ).join('\n\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
