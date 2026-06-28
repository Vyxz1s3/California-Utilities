import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('enable-command')
    .setDescription('Re-enable a disabled command in this server')
    .addStringOption(o => o.setName('command').setDescription('Command name to enable').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'enable-command',
  description: 'Re-enable a disabled command in this server',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const command = interaction.options.getString('command');

    await query(
      'DELETE FROM disabled_commands WHERE guild_id = $1 AND command_name = $2',
      [interaction.guild.id, command]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Command Enabled')
      .setDescription(`Command \`/${command}\` has been re-enabled in this server.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
