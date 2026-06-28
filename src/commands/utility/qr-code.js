import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('qr-code')
    .setDescription('Generate a QR code for any text or URL')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text or URL to encode')
        .setRequired(true)
    ),

  name: 'qr-code',
  description: 'Generate a QR code for any text or URL',

  async execute(interaction, client) {
    const text = interaction.options.getString('text');
    const encoded = encodeURIComponent(text);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;

    const embed = new EmbedBuilder()
      .setColor(0x2C3E50)
      .setTitle('📱 QR Code Generated')
      .setDescription(`**Content:** \`${text.length > 100 ? text.slice(0, 100) + '...' : text}\``)
      .setImage(qrUrl)
      .setFooter({ text: 'Scan with any QR code reader' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
