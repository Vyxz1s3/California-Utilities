import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Check how long the bot has been online'),

  name: 'uptime',
  description: 'Check how long the bot has been online',

  async execute(interaction, client) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const startTime = Date.now() - uptime * 1000;

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('⏱️ Bot Uptime')
      .addFields(
        { name: '🕐 Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: '📅 Online Since', value: `<t:${Math.floor(startTime / 1000)}:F>`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
