import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('sticky-remove')
    .setDescription('Remove the sticky message from this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'sticky-remove',
  description: 'Remove the sticky message from this channel',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission.', ephemeral: true });
    }

    const result = await query(
      'DELETE FROM sticky_messages WHERE channel_id = $1 AND guild_id = $2 RETURNING *',
      [interaction.channel.id, interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: '❌ No sticky message found in this channel.', ephemeral: true });
    }

    const msg = await interaction.channel.messages.fetch(result.rows[0].message_id).catch(() => null);
    if (msg) await msg.delete().catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🗑️ Sticky Message Removed')
      .setDescription('The sticky message has been removed from this channel.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
