import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear-warnings')
    .setDescription("Clear all warnings for a user")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to clear warnings for')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'clear-warnings',
  description: "Clear a user's warnings",

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to clear warnings.', ephemeral: true });
    }

    const result = await query(
      'DELETE FROM user_warnings WHERE guild_id = $1 AND user_id = $2',
      [interaction.guild.id, user.id]
    );

    // Also reset the warnings counter in members table
    await query(
      'UPDATE members SET warnings = 0 WHERE guild_id = $1 AND user_id = $2',
      [interaction.guild.id, user.id]
    );

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('✅ Warnings Cleared')
      .addFields(
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Cleared by', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
