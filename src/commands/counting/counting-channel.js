import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('counting-channel')
    .setDescription('Set the counting channel')
    .addChannelOption(o => o.setName('channel').setDescription('Channel for counting').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'counting-channel',
  description: 'Set the counting channel',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    await query(
      `INSERT INTO counting_channel_data (guild_id, channel_id, current_count, last_user_id)
       VALUES ($1, $2, 0, NULL)
       ON CONFLICT (guild_id) DO UPDATE SET channel_id = $2`,
      [interaction.guild.id, channel.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('🔢 Counting Channel Set')
      .setDescription(`Counting channel set to ${channel}. Start counting from **1**!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
