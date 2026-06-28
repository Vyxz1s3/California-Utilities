import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('appeal')
    .setDescription('Appeal a punishment')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for your appeal')
        .setRequired(true)
    ),

  name: 'appeal',
  description: 'Appeal a punishment',

  async execute(interaction, client) {
    const reason = interaction.options.getString('reason');

    // Check for existing pending appeal
    const existing = await query(
      "SELECT id FROM appeals WHERE guild_id = $1 AND user_id = $2 AND status = 'pending'",
      [interaction.guild.id, interaction.user.id]
    );

    if (existing.rows.length > 0) {
      return interaction.reply({
        content: '❌ You already have a pending appeal. Please wait for it to be reviewed.',
        ephemeral: true,
      });
    }

    const result = await query(
      'INSERT INTO appeals (guild_id, user_id, reason) VALUES ($1, $2, $3) RETURNING id',
      [interaction.guild.id, interaction.user.id, reason]
    );

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('📝 Appeal Submitted')
      .setDescription('Your appeal has been submitted and will be reviewed by the moderation team.')
      .addFields(
        { name: 'Appeal ID', value: `#${result.rows[0].id}`, inline: true },
        { name: 'Reason', value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
