import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const timezones = {
  'UTC': 'UTC',
  'EST': 'America/New_York',
  'CST': 'America/Chicago',
  'MST': 'America/Denver',
  'PST': 'America/Los_Angeles',
  'GMT': 'Europe/London',
  'CET': 'Europe/Paris',
  'IST': 'Asia/Kolkata',
  'JST': 'Asia/Tokyo',
  'AEST': 'Australia/Sydney',
};

export default {
  data: new SlashCommandBuilder()
    .setName('time')
    .setDescription('Get the current time in a timezone')
    .addStringOption(option =>
      option.setName('timezone')
        .setDescription('Timezone (UTC, EST, CST, MST, PST, GMT, CET, IST, JST, AEST)')
        .setRequired(false)
    ),

  name: 'time',
  description: 'Get the current time in a timezone',

  async execute(interaction, client) {
    const tzInput = (interaction.options.getString('timezone') || 'UTC').toUpperCase();
    const tz = timezones[tzInput] || 'UTC';

    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
      timeZone: tz,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('🕐 Current Time')
      .addFields(
        { name: '🌍 Timezone', value: `${tzInput} (${tz})`, inline: true },
        { name: '📅 Date & Time', value: formatted, inline: false },
        { name: '⏱️ Unix Timestamp', value: `<t:${Math.floor(now.getTime() / 1000)}:F>`, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
