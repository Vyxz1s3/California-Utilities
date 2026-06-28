import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('auto-response-config')
    .setDescription('Configure the auto response system')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable auto responses').setRequired(true))
    .addBooleanOption(o => o.setName('case_sensitive').setDescription('Case sensitive matching').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'auto-response-config',
  description: 'Configure the auto response system',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const enabled = interaction.options.getBoolean('enabled');
    const caseSensitive = interaction.options.getBoolean('case_sensitive') ?? false;

    const embed = new EmbedBuilder()
      .setColor(enabled ? 0x2ECC71 : 0xE74C3C)
      .setTitle('⚙️ Auto Response Configuration')
      .addFields(
        { name: '✅ Enabled', value: enabled ? 'Yes' : 'No', inline: true },
        { name: '🔤 Case Sensitive', value: caseSensitive ? 'Yes' : 'No', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
