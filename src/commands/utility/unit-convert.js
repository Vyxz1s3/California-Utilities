import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const conversions = {
  km_mi: { factor: 0.621371, label: 'km → miles' },
  mi_km: { factor: 1.60934, label: 'miles → km' },
  kg_lb: { factor: 2.20462, label: 'kg → lbs' },
  lb_kg: { factor: 0.453592, label: 'lbs → kg' },
  c_f: { factor: null, label: '°C → °F', fn: v => v * 9 / 5 + 32 },
  f_c: { factor: null, label: '°F → °C', fn: v => (v - 32) * 5 / 9 },
  m_ft: { factor: 3.28084, label: 'm → ft' },
  ft_m: { factor: 0.3048, label: 'ft → m' },
  l_gal: { factor: 0.264172, label: 'litres → gallons' },
  gal_l: { factor: 3.78541, label: 'gallons → litres' },
};

export default {
  data: new SlashCommandBuilder()
    .setName('unit-convert')
    .setDescription('Convert between units of measurement')
    .addNumberOption(option =>
      option.setName('value')
        .setDescription('Value to convert')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('conversion')
        .setDescription('Conversion type')
        .setRequired(true)
        .addChoices(
          { name: 'km → miles', value: 'km_mi' },
          { name: 'miles → km', value: 'mi_km' },
          { name: 'kg → lbs', value: 'kg_lb' },
          { name: 'lbs → kg', value: 'lb_kg' },
          { name: '°C → °F', value: 'c_f' },
          { name: '°F → °C', value: 'f_c' },
          { name: 'm → ft', value: 'm_ft' },
          { name: 'ft → m', value: 'ft_m' },
          { name: 'litres → gallons', value: 'l_gal' },
          { name: 'gallons → litres', value: 'gal_l' },
        )
    ),

  name: 'unit-convert',
  description: 'Convert between units of measurement',

  async execute(interaction, client) {
    const value = interaction.options.getNumber('value');
    const type = interaction.options.getString('conversion');
    const conv = conversions[type];

    const result = conv.fn ? conv.fn(value) : value * conv.factor;

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('📐 Unit Converter')
      .addFields(
        { name: '📥 Input', value: `${value} (${conv.label.split(' → ')[0]})`, inline: true },
        { name: '📤 Result', value: `${result.toFixed(4)} (${conv.label.split(' → ')[1]})`, inline: true },
        { name: '🔄 Conversion', value: conv.label, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
