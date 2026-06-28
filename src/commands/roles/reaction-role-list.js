import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reaction-role-list')
    .setDescription('List all reaction roles in this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  name: 'reaction-role-list',
  description: 'List all reaction roles in this server',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ You need Manage Roles permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM reaction_roles WHERE guild_id = $1 ORDER BY created_at DESC',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🎭 Reaction Roles')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No reaction roles configured. Use `/reaction-role-add` to add one.');
    } else {
      const lines = result.rows.map(r =>
        `${r.emoji} → <@&${r.role_id}> (Message: \`${r.message_id}\`)`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
