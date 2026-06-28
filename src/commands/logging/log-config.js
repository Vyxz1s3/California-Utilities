import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('log-config')
    .setDescription('Configure the logging system')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to send logs to').setRequired(false))
    .addBooleanOption(o => o.setName('message_logs').setDescription('Log message edits/deletes').setRequired(false))
    .addBooleanOption(o => o.setName('member_logs').setDescription('Log member joins/leaves').setRequired(false))
    .addBooleanOption(o => o.setName('mod_logs').setDescription('Log moderation actions').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'log-config',
  description: 'Configure the logging system',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    const messageLogs = interaction.options.getBoolean('message_logs') ?? true;
    const memberLogs = interaction.options.getBoolean('member_logs') ?? true;
    const modLogs = interaction.options.getBoolean('mod_logs') ?? true;

    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    if (channel) {
      await query(
        'UPDATE guild_settings SET modlog_channel_id = $1 WHERE guild_id = $2',
        [channel.id, interaction.guild.id]
      ).catch(() => {});
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('⚙️ Logging Configuration')
      .addFields(
        { name: '📢 Log Channel', value: channel ? `${channel}` : 'Not changed', inline: true },
        { name: '💬 Message Logs', value: messageLogs ? '✅' : '❌', inline: true },
        { name: '👥 Member Logs', value: memberLogs ? '✅' : '❌', inline: true },
        { name: '🔨 Mod Logs', value: modLogs ? '✅' : '❌', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
