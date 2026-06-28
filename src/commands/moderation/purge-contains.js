import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('purge-contains')
    .setDescription('Delete messages containing specific text')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to search for in messages')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to scan (1–100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'purge-contains',
  description: 'Delete messages containing text',

  async execute(interaction, client) {
    const text = interaction.options.getString('text').toLowerCase();
    const amount = interaction.options.getInteger('amount');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You do not have permission to manage messages.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const matching = messages
      .filter(m => m.content.toLowerCase().includes(text))
      .first(amount);

    if (matching.length === 0) {
      return interaction.editReply({ content: '❌ No messages found containing that text.' });
    }

    const deleted = await interaction.channel.bulkDelete(matching, true);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🗑️ Messages Purged')
      .addFields(
        { name: 'Filter', value: `"${text}"`, inline: true },
        { name: 'Deleted', value: `${deleted.size} message(s)`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
