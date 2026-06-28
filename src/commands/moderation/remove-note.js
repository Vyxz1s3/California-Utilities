import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remove-note')
    .setDescription('Remove a note from a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Member to remove a note from')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('note_id')
        .setDescription('ID of the note to remove')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'remove-note',
  description: 'Remove a note from a member',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const noteId = interaction.options.getInteger('note_id');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to remove member notes.', ephemeral: true });
    }

    const result = await query(
      'DELETE FROM member_notes WHERE id = $1 AND guild_id = $2 AND user_id = $3 RETURNING id',
      [noteId, interaction.guild.id, user.id]
    );

    if (result.rows.length === 0) {
      return interaction.reply({ content: '❌ Note not found.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🗑️ Note Removed')
      .addFields(
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Note ID', value: `#${noteId}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
