import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';

const channelTypeNames = {
  [ChannelType.GuildText]: 'Text',
  [ChannelType.GuildVoice]: 'Voice',
  [ChannelType.GuildCategory]: 'Category',
  [ChannelType.GuildAnnouncement]: 'Announcement',
  [ChannelType.GuildStageVoice]: 'Stage',
  [ChannelType.GuildForum]: 'Forum',
  [ChannelType.GuildThread]: 'Thread',
};

export default {
  data: new SlashCommandBuilder()
    .setName('channel-info')
    .setDescription('Get information about a channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to inspect (defaults to current channel)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  name: 'channel-info',
  description: 'Get channel info',

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`📋 Channel Info — #${channel.name}`)
      .addFields(
        { name: 'ID', value: channel.id, inline: true },
        { name: 'Type', value: channelTypeNames[channel.type] || 'Unknown', inline: true },
        { name: 'Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp();

    if (channel.topic) embed.addFields({ name: 'Topic', value: channel.topic });
    if (channel.rateLimitPerUser) embed.addFields({ name: 'Slowmode', value: `${channel.rateLimitPerUser}s`, inline: true });
    if (channel.nsfw !== undefined) embed.addFields({ name: 'NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true });
    if (channel.parent) embed.addFields({ name: 'Category', value: channel.parent.name, inline: true });

    await interaction.reply({ embeds: [embed] });
  },
};
