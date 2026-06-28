import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  name: 'unlock',
  description: 'Unlock a channel',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ You do not have permission to manage channels.', ephemeral: true });
    }

    const everyoneRole = interaction.guild.roles.everyone;
    await interaction.channel.permissionOverwrites.edit(everyoneRole, {
      SendMessages: null,
    });

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🔓 Channel Unlocked')
      .setDescription(`${interaction.channel} has been unlocked.`)
      .addFields({ name: 'Unlocked by', value: interaction.user.tag, inline: true })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
