import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('poll-end')
    .setDescription('End a poll early')
    .addStringOption(o => o.setName('message_id').setDescription('Poll message ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'poll-end',
  description: 'End a poll early',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission.', ephemeral: true });
    }

    const messageId = interaction.options.getString('message_id');

    await query(
      'UPDATE polls SET status = $1, ends_at = NOW() WHERE guild_id = $2 AND message_id = $3',
      ['ended', interaction.guild.id, messageId]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🛑 Poll Ended')
      .setDescription(`Poll \`${messageId}\` has been ended. Use \`/poll-results\` to view the results.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
