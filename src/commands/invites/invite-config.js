import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('invite-config')
    .setDescription('Configure invite tracking')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable invite tracking').setRequired(true))
    .addChannelOption(o => o.setName('log_channel').setDescription('Channel to log join/leave events').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'invite-config',
  description: 'Configure invite tracking',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const enabled = interaction.options.getBoolean('enabled');
    const logChannel = interaction.options.getChannel('log_channel');

    const embed = new EmbedBuilder()
      .setColor(enabled ? 0x2ECC71 : 0xE74C3C)
      .setTitle('⚙️ Invite Tracking Configuration')
      .addFields(
        { name: '✅ Enabled', value: enabled ? 'Yes' : 'No', inline: true },
        { name: '📋 Log Channel', value: logChannel ? `${logChannel}` : 'Not set', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
