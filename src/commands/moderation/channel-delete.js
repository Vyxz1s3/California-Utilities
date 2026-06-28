import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('channel-delete')
    .setDescription('Delete a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to delete')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  name: 'channel-delete',
  description: 'Delete a channel',

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ You do not have permission to manage channels.', ephemeral: true });
    }

    const channelName = channel.name;
    await channel.delete(`Deleted by ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🗑️ Channel Deleted')
      .addFields(
        { name: 'Channel', value: `#${channelName}`, inline: true },
        { name: 'Deleted by', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
