import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reaction-role-config')
    .setDescription('Configure the reaction role system')
    .addBooleanOption(o => o.setName('enabled').setDescription('Enable or disable reaction roles').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'reaction-role-config',
  description: 'Configure the reaction role system',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const enabled = interaction.options.getBoolean('enabled');

    const embed = new EmbedBuilder()
      .setColor(enabled ? 0x2ECC71 : 0xE74C3C)
      .setTitle('⚙️ Reaction Role Configuration')
      .setDescription(`Reaction roles have been **${enabled ? 'enabled' : 'disabled'}**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
