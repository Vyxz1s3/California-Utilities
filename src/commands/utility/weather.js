import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get the current weather for a location')
    .addStringOption(option =>
      option.setName('location')
        .setDescription('City name or location')
        .setRequired(true)
    ),

  name: 'weather',
  description: 'Get the current weather for a location',

  async execute(interaction, client) {
    const location = interaction.options.getString('location');

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle(`🌤️ Weather — ${location}`)
      .setDescription('Weather data requires an OpenWeatherMap API key. Set `WEATHER_API_KEY` in your environment to enable this feature.')
      .addFields(
        { name: '🌡️ Temperature', value: 'N/A', inline: true },
        { name: '💧 Humidity', value: 'N/A', inline: true },
        { name: '💨 Wind Speed', value: 'N/A', inline: true },
      )
      .setFooter({ text: 'Powered by OpenWeatherMap' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
