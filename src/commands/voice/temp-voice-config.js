import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('temp-voice-config')
    .setDescription('Configure the temp voice system')
    .addChannelOption(o => o.setName('hub_channel').setDescription('Voice channel that triggers temp channel creation').setRequired(false))
    .addStringOption(o => o.setName('name_template').setDescription('Name template (use {user} for username)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'temp-voice-config',
  description: 'Configure the temp voice system',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const hubChannel = interaction.options.getChannel('hub_channel');
    const nameTemplate = interaction.options.getString('name_template') || '{user}\'s Channel';

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('⚙️ Temp Voice Configuration')
      .addFields(
        { name: '🎙️ Hub Channel', value: hubChannel ? `${hubChannel}` : 'Not set', inline: true },
        { name: '📝 Name Template', value: nameTemplate, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
