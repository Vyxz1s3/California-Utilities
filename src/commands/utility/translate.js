import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text to another language')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to translate')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('language')
        .setDescription('Target language code (e.g. es, fr, de, ja)')
        .setRequired(true)
    ),

  name: 'translate',
  description: 'Translate text to another language',

  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    const lang = interaction.options.getString('language');

    const embed = new EmbedBuilder()
      .setColor(0x4285F4)
      .setTitle('🌐 Translation')
      .addFields(
        { name: '📥 Original', value: text, inline: false },
        { name: '📤 Translated', value: 'Translation requires a Google Translate API key. Set `TRANSLATE_API_KEY` in your environment.', inline: false },
        { name: '🌍 Target Language', value: lang.toUpperCase(), inline: true },
      )
      .setFooter({ text: 'Powered by Google Translate' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
