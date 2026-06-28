import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('snipe-clear')
    .setDescription('Clear the snipe cache for this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'snipe-clear',
  description: 'Clear the snipe cache for this channel',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission.', ephemeral: true });
    }

    if (client.snipeCache) client.snipeCache.delete(interaction.channel.id);
    if (client.editSnipeCache) client.editSnipeCache.delete(interaction.channel.id);

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('🗑️ Snipe Cache Cleared')
      .setDescription(`Snipe cache for ${interaction.channel} has been cleared.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
