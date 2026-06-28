import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('deny-appeal')
    .setDescription('Deny a punishment appeal')
    .addIntegerOption(option =>
      option.setName('appeal_id')
        .setDescription('ID of the appeal to deny')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for denial')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'deny-appeal',
  description: 'Deny an appeal',

  async execute(interaction, client) {
    const appealId = interaction.options.getInteger('appeal_id');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to review appeals.', ephemeral: true });
    }

    const result = await query(
      "UPDATE appeals SET status = 'denied', reviewed_by = $1, review_reason = $2, reviewed_at = NOW() WHERE id = $3 AND guild_id = $4 AND status = 'pending' RETURNING *",
      [interaction.user.id, reason, appealId, interaction.guild.id]
    );

    if (result.rows.length === 0) {
      return interaction.reply({ content: '❌ Appeal not found or already reviewed.', ephemeral: true });
    }

    const appeal = result.rows[0];

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('❌ Appeal Denied')
      .addFields(
        { name: 'Appeal ID', value: `#${appeal.id}`, inline: true },
        { name: 'User', value: `<@${appeal.user_id}>`, inline: true },
        { name: 'Reviewed by', value: interaction.user.tag, inline: true },
        { name: 'Denial Reason', value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Notify the user if possible
    const user = await client.users.fetch(appeal.user_id).catch(() => null);
    if (user) {
      user.send(`❌ Your appeal in **${interaction.guild.name}** (ID: #${appeal.id}) has been **denied**.\n**Reason:** ${reason}`).catch(() => {});
    }
  },
};
