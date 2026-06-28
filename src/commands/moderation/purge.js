import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete a number of messages from the current channel')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1–100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'purge',
  description: 'Delete messages from a channel',

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You do not have permission to manage messages.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    const deleted = await interaction.channel.bulkDelete(amount, true);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🗑️ Messages Purged')
      .setDescription(`Deleted **${deleted.size}** message(s) from ${interaction.channel}.`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
