import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('add-note')
    .setDescription('Add a note to a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Member to add a note to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('note')
        .setDescription('Note content')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'add-note',
  description: 'Add a note to a member',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const note = interaction.options.getString('note');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to add member notes.', ephemeral: true });
    }

    const result = await query(
      'INSERT INTO member_notes (guild_id, user_id, moderator_id, note) VALUES ($1, $2, $3, $4) RETURNING id',
      [interaction.guild.id, user.id, interaction.user.id, note]
    );

    const embed = new EmbedBuilder()
      .setColor(0x1abc9c)
      .setTitle('📝 Note Added')
      .addFields(
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Note ID', value: `#${result.rows[0].id}`, inline: true },
        { name: 'Note', value: note }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
