import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reaction-role-test')
    .setDescription('Test a reaction role configuration')
    .addStringOption(o => o.setName('message_id').setDescription('Message ID to test').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  name: 'reaction-role-test',
  description: 'Test a reaction role configuration',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ You need Manage Roles permission.', ephemeral: true });
    }

    const messageId = interaction.options.getString('message_id');

    const result = await query(
      'SELECT * FROM reaction_roles WHERE guild_id = $1 AND message_id = $2',
      [interaction.guild.id, messageId]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(result.rows.length ? 0x2ECC71 : 0xE74C3C)
      .setTitle('🧪 Reaction Role Test')
      .addFields(
        { name: '📨 Message ID', value: messageId, inline: true },
        { name: '✅ Configured Roles', value: `${result.rows.length}`, inline: true },
      );

    if (result.rows.length) {
      embed.setDescription(result.rows.map(r => `${r.emoji} → <@&${r.role_id}>`).join('\n'));
    } else {
      embed.setDescription('No reaction roles found for this message.');
    }

    embed.setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
