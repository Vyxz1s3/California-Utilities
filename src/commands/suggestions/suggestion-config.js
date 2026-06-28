import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('suggestion-config')
    .setDescription('Configure the suggestion system')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to post suggestions in').setRequired(false))
    .addBooleanOption(o => o.setName('anonymous').setDescription('Allow anonymous suggestions').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'suggestion-config',
  description: 'Configure the suggestion system',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    const anonymous = interaction.options.getBoolean('anonymous') ?? false;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('⚙️ Suggestion Configuration')
      .addFields(
        { name: '📢 Channel', value: channel ? `${channel}` : 'Not set', inline: true },
        { name: '🕵️ Anonymous', value: anonymous ? 'Yes' : 'No', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
