import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-rename')
    .setDescription('Rename the current ticket channel')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('New name for the ticket')
        .setRequired(true)
    ),

  name: 'ticket-rename',
  description: 'Rename the current ticket channel',

  async execute(interaction, client) {
    const name = interaction.options.getString('name');
    const oldName = interaction.channel.name;

    await interaction.channel.setName(`ticket-${name}`).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('✏️ Ticket Renamed')
      .addFields(
        { name: 'Old Name', value: oldName, inline: true },
        { name: 'New Name', value: `ticket-${name}`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
