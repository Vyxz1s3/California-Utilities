import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set the slowmode for the current channel')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Slowmode in seconds (0 to disable, max 21600)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  name: 'slowmode',
  description: 'Set channel slowmode',

  async execute(interaction, client) {
    const seconds = interaction.options.getInteger('seconds');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ You do not have permission to manage channels.', ephemeral: true });
    }

    if (interaction.channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: '❌ This command can only be used in text channels.', ephemeral: true });
    }

    await interaction.channel.setRateLimitPerUser(seconds);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🐢 Slowmode Updated')
      .setDescription(seconds === 0 ? 'Slowmode has been **disabled**.' : `Slowmode set to **${seconds} second(s)**.`)
      .addFields({ name: 'Channel', value: `${interaction.channel}`, inline: true })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
