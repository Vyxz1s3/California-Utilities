import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-remove')
    .setDescription('Remove a user from the current ticket')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove')
        .setRequired(true)
    ),

  name: 'ticket-remove',
  description: 'Remove a user from the current ticket',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: false,
    }).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('❌ User Removed from Ticket')
      .setDescription(`${user} has been removed from this ticket.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
