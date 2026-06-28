import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('approve-appeal')
    .setDescription('Approve a punishment appeal')
    .addIntegerOption(option =>
      option.setName('appeal_id')
        .setDescription('ID of the appeal to approve')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'approve-appeal',
  description: 'Approve an appeal',

  async execute(interaction, client) {
    const appealId = interaction.options.getInteger('appeal_id');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to review appeals.', ephemeral: true });
    }

    const result = await query(
      "UPDATE appeals SET status = 'approved', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2 AND guild_id = $3 AND status = 'pending' RETURNING *",
      [interaction.user.id, appealId, interaction.guild.id]
    );

    if (result.rows.length === 0) {
      return interaction.reply({ content: '❌ Appeal not found or already reviewed.', ephemeral: true });
    }

    const appeal = result.rows[0];

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('✅ Appeal Approved')
      .addFields(
        { name: 'Appeal ID', value: `#${appeal.id}`, inline: true },
        { name: 'User', value: `<@${appeal.user_id}>`, inline: true },
        { name: 'Reviewed by', value: interaction.user.tag, inline: true },
        { name: 'Original Reason', value: appeal.reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Notify the user if possible
    const user = await client.users.fetch(appeal.user_id).catch(() => null);
    if (user) {
      user.send(`✅ Your appeal in **${interaction.guild.name}** (ID: #${appeal.id}) has been **approved**.`).catch(() => {});
    }
  },
};
