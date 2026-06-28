import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('backup-list')
    .setDescription('List all server backups')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  name: 'backup-list',
  description: 'List all server backups',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT id, name, created_by, created_at FROM backups WHERE guild_id = $1 ORDER BY created_at DESC LIMIT 10',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📦 Server Backups')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No backups found. Use `/backup-create` to create one.');
    } else {
      const lines = result.rows.map((b, i) =>
        `**#${b.id}** — \`${b.name}\` | By <@${b.created_by}> | <t:${Math.floor(new Date(b.created_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
