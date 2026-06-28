import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('settings-update')
    .setDescription('Update a server setting')
    .addStringOption(o =>
      o.setName('setting')
        .setDescription('Setting to update')
        .setRequired(true)
        .addChoices(
          { name: 'Welcome Enabled', value: 'welcome_enabled' },
          { name: 'Goodbye Enabled', value: 'goodbye_enabled' },
          { name: 'Anti-Spam', value: 'anti_spam' },
          { name: 'Anti-Raid', value: 'anti_raid' },
          { name: 'Anti-Link', value: 'anti_link' },
          { name: 'Anti-Nuke', value: 'anti_nuke' },
        )
    )
    .addBooleanOption(o => o.setName('value').setDescription('New value').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'settings-update',
  description: 'Update a server setting',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const setting = interaction.options.getString('setting');
    const value = interaction.options.getBoolean('value');

    await query(
      `UPDATE guild_settings SET ${setting} = $1 WHERE guild_id = $2`,
      [value, interaction.guild.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Setting Updated')
      .addFields(
        { name: '⚙️ Setting', value: setting.replace(/_/g, ' '), inline: true },
        { name: '📊 Value', value: value ? 'Enabled' : 'Disabled', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
