import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('channel-rename')
    .setDescription('Rename a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to rename')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('new_name')
        .setDescription('New name for the channel')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  name: 'channel-rename',
  description: 'Rename a channel',

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const newName = interaction.options.getString('new_name');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ You do not have permission to manage channels.', ephemeral: true });
    }

    const oldName = channel.name;
    await channel.setName(newName);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('✏️ Channel Renamed')
      .addFields(
        { name: 'Old Name', value: `#${oldName}`, inline: true },
        { name: 'New Name', value: `${channel}`, inline: true },
        { name: 'Renamed by', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
