import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('auto-response-list')
    .setDescription('List all auto responses for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'auto-response-list',
  description: 'List all auto responses for this server',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM auto_responses WHERE guild_id = $1 ORDER BY created_at DESC LIMIT 20',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🤖 Auto Responses')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No auto responses configured. Use `/auto-response-add` to add one.');
    } else {
      const lines = result.rows.map((r, i) =>
        `**#${i + 1}** — Trigger: \`${r.trigger}\` | Exact: ${r.exact_match ? 'Yes' : 'No'}`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
