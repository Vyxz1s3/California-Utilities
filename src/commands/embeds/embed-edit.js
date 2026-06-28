import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('embed-edit')
    .setDescription('Edit an existing embed message')
    .addStringOption(o => o.setName('message_id').setDescription('Message ID to edit').setRequired(true))
    .addStringOption(o => o.setName('title').setDescription('New title').setRequired(false))
    .addStringOption(o => o.setName('description').setDescription('New description').setRequired(false))
    .addStringOption(o => o.setName('color').setDescription('New hex color').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'embed-edit',
  description: 'Edit an existing embed message',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission.', ephemeral: true });
    }

    const messageId = interaction.options.getString('message_id');
    const msg = await interaction.channel.messages.fetch(messageId).catch(() => null);

    if (!msg || !msg.author.bot) {
      return interaction.reply({ content: '❌ Message not found or is not a bot message.', ephemeral: true });
    }

    const oldEmbed = msg.embeds[0];
    if (!oldEmbed) {
      return interaction.reply({ content: '❌ That message does not contain an embed.', ephemeral: true });
    }

    const title = interaction.options.getString('title') || oldEmbed.title;
    const description = interaction.options.getString('description') || oldEmbed.description;
    const colorStr = interaction.options.getString('color');
    const color = colorStr ? parseInt(colorStr.replace('#', ''), 16) : (oldEmbed.color || 0x5865F2);

    const newEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title);

    if (description) newEmbed.setDescription(description);
    if (oldEmbed.footer) newEmbed.setFooter(oldEmbed.footer);
    if (oldEmbed.image) newEmbed.setImage(oldEmbed.image.url);

    await msg.edit({ embeds: [newEmbed] });
    await interaction.reply({ content: '✅ Embed updated.', ephemeral: true });
  },
};
