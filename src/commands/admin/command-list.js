import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('command-list')
    .setDescription('List all commands and their status in this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'command-list',
  description: 'List all commands and their status in this server',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const disabledResult = await query(
      'SELECT command_name FROM disabled_commands WHERE guild_id = $1',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const disabled = new Set(disabledResult.rows.map(r => r.command_name));
    const allCommands = [...client.slashCommands.keys()];

    const enabledList = allCommands.filter(c => !disabled.has(c)).map(c => `\`/${c}\``).join(', ');
    const disabledList = [...disabled].map(c => `\`/${c}\``).join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 Command List')
      .addFields(
        { name: `✅ Enabled (${allCommands.length - disabled.size})`, value: enabledList.slice(0, 1024) || 'None', inline: false },
        { name: `❌ Disabled (${disabled.size})`, value: disabledList, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
