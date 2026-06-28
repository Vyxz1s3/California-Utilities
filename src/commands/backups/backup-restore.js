import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('backup-restore')
    .setDescription('Restore a server backup (WARNING: This modifies the server)')
    .addIntegerOption(o => o.setName('id').setDescription('Backup ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  name: 'backup-restore',
  description: 'Restore a server backup',

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

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('⚠️ Backup Restore')
      .setDescription(`Restoring backup **${result.rows[0].name}** would modify server roles and channels. Full automated restore is a premium feature — backup data is preserved and can be used as a reference.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
