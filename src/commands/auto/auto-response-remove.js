import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('auto-response-remove')
    .setDescription('Remove an auto response by trigger')
    .addStringOption(o => o.setName('trigger').setDescription('Trigger phrase to remove').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'auto-response-remove',
  description: 'Remove an auto response by trigger',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const trigger = interaction.options.getString('trigger');

    const result = await query(
      'DELETE FROM auto_responses WHERE guild_id = $1 AND trigger = $2 RETURNING *',
      [interaction.guild.id, trigger.toLowerCase()]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: `❌ No auto response found for trigger \`${trigger}\`.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🗑️ Auto Response Removed')
      .setDescription(`Auto response for \`${trigger}\` has been removed.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
