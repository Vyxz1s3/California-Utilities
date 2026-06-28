import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('embed-delete')
    .setDescription('Delete an embed message')
    .addStringOption(o => o.setName('message_id').setDescription('Message ID to delete').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'embed-delete',
  description: 'Delete an embed message',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission.', ephemeral: true });
    }

    const messageId = interaction.options.getString('message_id');
    const msg = await interaction.channel.messages.fetch(messageId).catch(() => null);

    if (!msg) {
      return interaction.reply({ content: '❌ Message not found.', ephemeral: true });
    }

    await msg.delete().catch(() => {});
    await interaction.reply({ content: '✅ Message deleted.', ephemeral: true });
  },
};
