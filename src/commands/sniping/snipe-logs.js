import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('snipe-logs')
    .setDescription('View snipe activity logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'snipe-logs',
  description: 'View snipe activity logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const snipeCache = client.snipeCache || new Map();
    const count = snipeCache.size;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 Snipe Logs')
      .addFields(
        { name: '📦 Cached Channels', value: `${count}`, inline: true },
        { name: '💡 Note', value: 'Snipe cache is stored in memory and resets on bot restart.', inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
