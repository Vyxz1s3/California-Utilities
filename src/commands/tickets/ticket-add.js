import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-add')
    .setDescription('Add a user to the current ticket')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to add')
        .setRequired(true)
    ),

  name: 'ticket-add',
  description: 'Add a user to the current ticket',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
    }).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ User Added to Ticket')
      .setDescription(`${user} has been added to this ticket.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
