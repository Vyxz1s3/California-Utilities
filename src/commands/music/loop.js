import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set the loop mode')
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Loop mode')
        .setRequired(true)
        .addChoices(
          { name: '🚫 Off', value: 'off' },
          { name: '🔂 Song', value: 'song' },
          { name: '🔁 Queue', value: 'queue' },
        )
    ),

  name: 'loop',
  description: 'Set the loop mode',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const mode = interaction.options.getString('mode');
    const icons = { off: '🚫', song: '🔂', queue: '🔁' };
    const labels = { off: 'Off', song: 'Song Loop', queue: 'Queue Loop' };

    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle(`${icons[mode]} Loop Mode`)
      .setDescription(`Loop mode set to **${labels[mode]}**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
