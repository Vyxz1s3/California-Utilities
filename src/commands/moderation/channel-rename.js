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
      option.setName('name')
        .setDescription('New channel name')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  name: 'channel-rename',
  description: 'Rename a channel',

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const newName = interaction.options.getString('name');

    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator permission to rename channels.', ephemeral: true });
    }

    const oldName = channel.name;
    await channel.setName(newName, `Renamed by ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('✏️ Channel Renamed')
      .addFields(
        { name: 'Old Name', value: `#${oldName}`, inline: true },
        { name: 'New Name', value: `#${newName}`, inline: true },
        { name: 'Renamed by', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

