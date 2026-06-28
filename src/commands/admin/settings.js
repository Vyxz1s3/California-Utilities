import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('View all server settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'settings',
  description: 'View all server settings',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    const [guildResult, settingsResult] = await Promise.all([
      query('SELECT * FROM guilds WHERE id = $1', [interaction.guild.id]),
      query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]),
    ]).catch(() => [{ rows: [] }, { rows: [] }]);

    const guild = guildResult.rows[0] || {};
    const settings = settingsResult.rows[0] || {};

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`⚙️ Server Settings — ${interaction.guild.name}`)
      .setThumbnail(interaction.guild.iconURL())
      .addFields(
        { name: '📝 Prefix', value: guild.prefix || '!', inline: true },
        { name: '🌐 Language', value: guild.language || 'en', inline: true },
        { name: '👋 Welcome', value: settings.welcome_enabled ? `✅ <#${settings.welcome_channel_id}>` : '❌ Disabled', inline: true },
        { name: '👋 Goodbye', value: settings.goodbye_enabled ? `✅ <#${settings.goodbye_channel_id}>` : '❌ Disabled', inline: true },
        { name: '📋 Mod Log', value: settings.modlog_channel_id ? `<#${settings.modlog_channel_id}>` : 'Not set', inline: true },
        { name: '🛡️ Anti-Spam', value: settings.anti_spam ? '✅' : '❌', inline: true },
        { name: '🛡️ Anti-Raid', value: settings.anti_raid ? '✅' : '❌', inline: true },
        { name: '🛡️ Anti-Link', value: settings.anti_link ? '✅' : '❌', inline: true },
        { name: '🛡️ Anti-Nuke', value: settings.anti_nuke ? '✅' : '❌', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
