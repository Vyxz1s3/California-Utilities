import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('sticky-add')
    .setDescription('Add a sticky message to this channel')
    .addStringOption(o => o.setName('message').setDescription('Message to stick').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'sticky-add',
  description: 'Add a sticky message to this channel',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission.', ephemeral: true });
    }

    const message = interaction.options.getString('message');
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('📌 Sticky Message')
      .setDescription(message)
      .setFooter({ text: 'This message is pinned to this channel' })
      .setTimestamp();

    const sent = await interaction.channel.send({ embeds: [embed] });

    await query(
      `INSERT INTO sticky_messages (guild_id, channel_id, message_id, content, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (channel_id) DO UPDATE SET message_id = $3, content = $4`,
      [interaction.guild.id, interaction.channel.id, sent.id, message, interaction.user.id]
    ).catch(() => {});

    await interaction.reply({ content: '✅ Sticky message added.', ephemeral: true });
  },
};
