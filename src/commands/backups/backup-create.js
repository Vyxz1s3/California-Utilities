import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('backup-create')
    .setDescription('Create a backup of the server configuration')
    .addStringOption(o => o.setName('name').setDescription('Backup name').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  name: 'backup-create',
  description: 'Create a backup of the server configuration',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You need Administrator permission.', ephemeral: true });
    }

    await interaction.deferReply();
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    const name = interaction.options.getString('name') || `backup-${Date.now()}`;
    const guild = interaction.guild;

    const backupData = {
      name: guild.name,
      icon: guild.iconURL(),
      roles: guild.roles.cache.map(r => ({ name: r.name, color: r.color, permissions: r.permissions.bitfield.toString(), position: r.position })),
      channels: guild.channels.cache.map(c => ({ name: c.name, type: c.type, position: c.position })),
      settings: { verificationLevel: guild.verificationLevel },
    };

    await query(
      'INSERT INTO backups (guild_id, name, data, created_by) VALUES ($1, $2, $3, $4)',
      [guild.id, name, JSON.stringify(backupData), interaction.user.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Backup Created')
      .addFields(
        { name: '📋 Name', value: name, inline: true },
        { name: '🏠 Server', value: guild.name, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '📢 Channels', value: `${guild.channels.cache.size}`, inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
