import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('backup-delete')
    .setDescription('Delete a server backup')
    .addIntegerOption(o => o.setName('id').setDescription('Backup ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  name: 'backup-delete',
  description: 'Delete a server backup',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
    }

    const id = interaction.options.getInteger('id');

    const result = await query(
      'DELETE FROM backups WHERE id = $1 AND guild_id = $2 RETURNING *',
      [id, interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: '❌ Backup not found.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🗑️ Backup Deleted')
      .setDescription(`Backup **#${id}** (\`${result.rows[0].name}\`) has been deleted.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
