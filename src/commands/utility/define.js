import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Define a word using the dictionary')
    .addStringOption(option =>
      option.setName('word')
        .setDescription('Word to define')
        .setRequired(true)
    ),

  name: 'define',
  description: 'Define a word using the dictionary',

  async execute(interaction, client) {
    const word = interaction.options.getString('word');

    await interaction.deferReply();

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      const entry = data[0];
      const meaning = entry.meanings[0];
      const definition = meaning.definitions[0];

      const embed = new EmbedBuilder()
        .setColor(0x9B59B6)
        .setTitle(`📖 ${entry.word}`)
        .addFields(
          { name: '📝 Part of Speech', value: meaning.partOfSpeech, inline: true },
          { name: '📚 Definition', value: definition.definition, inline: false },
        );

      if (definition.example) {
        embed.addFields({ name: '💬 Example', value: `*"${definition.example}"*`, inline: false });
      }

      if (entry.phonetics?.[0]?.text) {
        embed.addFields({ name: '🔊 Phonetic', value: entry.phonetics[0].text, inline: true });
      }

      embed.setFooter({ text: 'Powered by Free Dictionary API' }).setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ content: `❌ Could not find a definition for **${word}**.` });
    }
  },
};
