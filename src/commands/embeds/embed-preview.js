import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('embed-preview')
    .setDescription('Preview an embed before sending')
    .addStringOption(o => o.setName('title').setDescription('Embed title').setRequired(true))
    .addStringOption(o => o.setName('description').setDescription('Embed description').setRequired(false))
    .addStringOption(o => o.setName('color').setDescription('Hex color (e.g. #FF0000)').setRequired(false))
    .addStringOption(o => o.setName('footer').setDescription('Footer text').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'embed-preview',
  description: 'Preview an embed before sending',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission.', ephemeral: true });
    }

    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description') || '';
    const colorStr = interaction.options.getString('color') || '#5865F2';
    const footer = interaction.options.getString('footer');

    const color = parseInt(colorStr.replace('#', ''), 16) || 0x5865F2;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title);

    if (description) embed.setDescription(description);
    if (footer) embed.setFooter({ text: footer });
    embed.setTimestamp();

    await interaction.reply({ content: '👁️ **Preview** (only visible to you):', embeds: [embed], ephemeral: true });
  },
};
