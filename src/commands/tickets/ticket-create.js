import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-create')
    .setDescription('Create a support ticket')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ticket')
        .setRequired(false)
    ),

  name: 'ticket-create',
  description: 'Create a support ticket',

  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'No reason provided';
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ],
    });

    await query(
      'INSERT INTO tickets (guild_id, channel_id, user_id, status) VALUES ($1, $2, $3, $4)',
      [interaction.guild.id, channel.id, interaction.user.id, 'open']
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('🎫 Ticket Created')
      .addFields(
        { name: '📋 Reason', value: reason, inline: false },
        { name: '📢 Channel', value: `${channel}`, inline: true },
        { name: '👤 Opened by', value: interaction.user.tag, inline: true },
      )
      .setFooter({ text: 'Use /ticket-close to close this ticket' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
  },
};
