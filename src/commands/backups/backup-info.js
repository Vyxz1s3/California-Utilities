import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('backup-info')
    .setDescription('View information about a backup')
    .addIntegerOption(o => o.setName('id').setDescription('Backup ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  name: 'backup-info',
  description: 'View information about a backup',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
    }

    const id = interaction.options.getInteger('id');

    const result = await query(
      'SELECT * FROM backups WHERE id = $1 AND guild_id = $2',
      [id, interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: '❌ Backup not found.', ephemeral: true });
    }

    const backup = result.rows[0];
    const data = JSON.parse(backup.data);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`📦 Backup #${id} — ${backup.name}`)
      .addFields(
        { name: '🏠 Server Name', value: data.name || 'Unknown', inline: true },
        { name: '🎭 Roles', value: `${data.roles?.length || 0}`, inline: true },
        { name: '📢 Channels', value: `${data.channels?.length || 0}`, inline: true },
        { name: '👤 Created by', value: `<@${backup.created_by}>`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(new Date(backup.created_at).getTime() / 1000)}:F>`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
