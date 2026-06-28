import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('temp-voice-create')
    .setDescription('Create a temporary voice channel')
    .addStringOption(o => o.setName('name').setDescription('Channel name').setRequired(false))
    .addIntegerOption(o => o.setName('limit').setDescription('User limit (0 = unlimited)').setRequired(false).setMinValue(0).setMaxValue(99)),

  name: 'temp-voice-create',
  description: 'Create a temporary voice channel',

  async execute(interaction, client) {
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);
    const name = interaction.options.getString('name') || `${interaction.user.username}'s Channel`;
    const limit = interaction.options.getInteger('limit') ?? 0;

    const channel = await interaction.guild.channels.create({
      name,
      type: ChannelType.GuildVoice,
      userLimit: limit,
      permissionOverwrites: [
        { id: interaction.user.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers] },
      ],
    });

    await query(
      'INSERT INTO temp_voice_channels (guild_id, channel_id, owner_id) VALUES ($1, $2, $3)',
      [interaction.guild.id, channel.id, interaction.user.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('🎙️ Temp Voice Channel Created')
      .addFields(
        { name: '📢 Channel', value: `${channel}`, inline: true },
        { name: '👥 Limit', value: limit === 0 ? 'Unlimited' : `${limit}`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
