import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('goodbye-channel')
    .setDescription('Set the channel for goodbye messages')
    .addChannelOption(o => o.setName('channel').setDescription('Goodbye channel').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'goodbye-channel',
  description: 'Set the channel for goodbye messages',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    await query(
      `UPDATE guild_settings SET goodbye_channel_id = $1, goodbye_enabled = TRUE WHERE guild_id = $2`,
      [channel.id, interaction.guild.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('✅ Goodbye Channel Set')
      .setDescription(`Goodbye messages will now be sent to ${channel}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
