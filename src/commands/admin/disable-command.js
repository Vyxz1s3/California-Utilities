import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('disable-command')
    .setDescription('Disable a command in this server')
    .addStringOption(o => o.setName('command').setDescription('Command name to disable').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'disable-command',
  description: 'Disable a command in this server',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const command = interaction.options.getString('command');

    if (!client.commands.has(command)) {
      return interaction.reply({ content: `❌ Command \`${command}\` not found.`, ephemeral: true });
    }

    if (['help', 'ping', 'settings', 'enable-command', 'disable-command'].includes(command)) {
      return interaction.reply({ content: `❌ Command \`${command}\` cannot be disabled.`, ephemeral: true });
    }

    await query(
      `INSERT INTO disabled_commands (guild_id, command_name) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [interaction.guild.id, command]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🚫 Command Disabled')
      .setDescription(`Command \`/${command}\` has been disabled in this server.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
