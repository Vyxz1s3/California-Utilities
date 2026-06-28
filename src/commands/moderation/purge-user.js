import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('purge-user')
    .setDescription("Delete a user's recent messages from the current channel")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User whose messages to delete')
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

  name: 'purge-user',
  description: "Delete a user's messages",

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You do not have permission to manage messages.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const userMessages = messages
      .filter(m => m.author.id === user.id)
      .first(amount);

    if (userMessages.length === 0) {
      return interaction.editReply({ content: '❌ No recent messages found from that user.' });
    }

    const deleted = await interaction.channel.bulkDelete(userMessages, true);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🗑️ User Messages Purged')
      .addFields(
        { name: 'User', value: `${user.tag}`, inline: true },
        { name: 'Deleted', value: `${deleted.size} message(s)`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
