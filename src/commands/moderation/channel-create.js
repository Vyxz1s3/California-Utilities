import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('channel-create')
    .setDescription('Create a new channel')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name of the new channel')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Channel type (default: text)')
        .setRequired(false)
        .addChoices(
          { name: 'Text', value: 'text' },
          { name: 'Voice', value: 'voice' },
          { name: 'Announcement', value: 'announcement' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  name: 'channel-create',
  description: 'Create a channel',

  async execute(interaction, client) {
    const name = interaction.options.getString('name');
    const typeStr = interaction.options.getString('type') || 'text';

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ You do not have permission to manage channels.', ephemeral: true });
    }

    const typeMap = {
      text: ChannelType.GuildText,
      voice: ChannelType.GuildVoice,
      announcement: ChannelType.GuildAnnouncement,
    };

    const channel = await interaction.guild.channels.create({
      name,
      type: typeMap[typeStr],
    });

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('✅ Channel Created')
      .addFields(
        { name: 'Channel', value: `${channel}`, inline: true },
        { name: 'Type', value: typeStr, inline: true },
        { name: 'Created by', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
