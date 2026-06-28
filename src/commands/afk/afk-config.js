import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('afk-config')
    .setDescription('Configure the AFK system')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable AFK system').setRequired(true))
    .addBooleanOption(o => o.setName('rename').setDescription('Add [AFK] prefix to nickname').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'afk-config',
  description: 'Configure the AFK system',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const enabled = interaction.options.getBoolean('enabled');
    const rename = interaction.options.getBoolean('rename') ?? false;

    const embed = new EmbedBuilder()
      .setColor(enabled ? 0x2ECC71 : 0xE74C3C)
      .setTitle('⚙️ AFK Configuration')
      .addFields(
        { name: '✅ Enabled', value: enabled ? 'Yes' : 'No', inline: true },
        { name: '✏️ Rename Nickname', value: rename ? 'Yes' : 'No', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
