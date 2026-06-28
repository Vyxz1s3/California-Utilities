import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('welcome-channel')
    .setDescription('Set the channel for welcome messages')
    .addChannelOption(o => o.setName('channel').setDescription('Welcome channel').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'welcome-channel',
  description: 'Set the channel for welcome messages',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    await query(
      `UPDATE guild_settings SET welcome_channel_id = $1, welcome_enabled = TRUE WHERE guild_id = $2`,
      [channel.id, interaction.guild.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Welcome Channel Set')
      .setDescription(`Welcome messages will now be sent to ${channel}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
