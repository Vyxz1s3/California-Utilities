import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import os from 'os';

export default {
  data: new SlashCommandBuilder()
    .setName('bot-stats')
    .setDescription('View detailed bot statistics'),

  name: 'bot-stats',
  description: 'View detailed bot statistics',

  async execute(interaction, client) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const memUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    const memTotal = os.totalmem() / 1024 / 1024;
    const cpuLoad = os.loadavg()[0].toFixed(2);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📊 Bot Statistics')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '🤖 Bot', value: client.user.tag, inline: true },
        { name: '🆔 ID', value: client.user.id, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '⏱️ Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: '🏓 Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: '🌐 Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Users', value: `${client.users.cache.size}`, inline: true },
        { name: '📦 Commands', value: `${client.commands.size}`, inline: true },
        { name: '💾 Memory', value: `${memUsed.toFixed(1)} MB / ${memTotal.toFixed(0)} MB`, inline: true },
        { name: '🖥️ CPU Load', value: `${cpuLoad}%`, inline: true },
        { name: '📟 Node.js', value: process.version, inline: true },
        { name: '📚 discord.js', value: 'v14', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
