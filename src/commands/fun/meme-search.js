import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const memeTemplates = {
  drake: { title: 'Drake Pointing', url: 'https://i.imgflip.com/30b1gx.jpg' },
  distracted: { title: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
  doge: { title: 'Doge', url: 'https://i.imgflip.com/4t0m5.jpg' },
  change: { title: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg' },
  button: { title: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
  expanding: { title: 'Expanding Brain', url: 'https://i.imgflip.com/1jwhww.jpg' },
  surprised: { title: 'Surprised Pikachu', url: 'https://i.imgflip.com/3lmzyx.jpg' },
  fine: { title: 'This Is Fine', url: 'https://i.imgflip.com/wxica.jpg' },
};

export default {
  data: new SlashCommandBuilder()
    .setName('meme-search')
    .setDescription('Search for a meme template')
    .addStringOption(option =>
      option.setName('template')
        .setDescription('Meme template name')
        .setRequired(true)
        .addChoices(
          { name: 'Drake Pointing', value: 'drake' },
          { name: 'Distracted Boyfriend', value: 'distracted' },
          { name: 'Doge', value: 'doge' },
          { name: 'Change My Mind', value: 'change' },
          { name: 'Two Buttons', value: 'button' },
          { name: 'Expanding Brain', value: 'expanding' },
          { name: 'Surprised Pikachu', value: 'surprised' },
          { name: 'This Is Fine', value: 'fine' },
        )
    ),

  name: 'meme-search',
  description: 'Search for a meme template',

  async execute(interaction, client) {
    const template = interaction.options.getString('template');
    const meme = memeTemplates[template];

    const embed = new EmbedBuilder()
      .setColor(0xFF6B6B)
      .setTitle(`😂 ${meme.title}`)
      .setImage(meme.url)
      .setFooter({ text: 'Use /meme for a random meme' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
