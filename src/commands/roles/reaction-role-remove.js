import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reaction-role-remove')
    .setDescription('Remove a reaction role from a message')
    .addStringOption(o => o.setName('message_id').setDescription('Message ID').setRequired(true))
    .addStringOption(o => o.setName('emoji').setDescription('Emoji of the reaction role').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  name: 'reaction-role-remove',
  description: 'Remove a reaction role from a message',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ You need Manage Roles permission.', ephemeral: true });
    }

    const messageId = interaction.options.getString('message_id');
    const emoji = interaction.options.getString('emoji');

    await query(
      'DELETE FROM reaction_roles WHERE guild_id = $1 AND message_id = $2 AND emoji = $3',
      [interaction.guild.id, messageId, emoji]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🗑️ Reaction Role Removed')
      .addFields(
        { name: '📨 Message ID', value: messageId, inline: true },
        { name: '😀 Emoji', value: emoji, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
