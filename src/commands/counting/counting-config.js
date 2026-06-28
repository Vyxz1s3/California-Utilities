import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('counting-config')
    .setDescription('Configure the counting channel')
    .addBooleanOption(o => o.setName('reset_on_fail').setDescription('Reset count when someone sends wrong number').setRequired(false))
    .addBooleanOption(o => o.setName('allow_same_user').setDescription('Allow same user to count twice in a row').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'counting-config',
  description: 'Configure the counting channel',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const resetOnFail = interaction.options.getBoolean('reset_on_fail') ?? true;
    const allowSameUser = interaction.options.getBoolean('allow_same_user') ?? false;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('⚙️ Counting Configuration')
      .addFields(
        { name: '🔄 Reset on Fail', value: resetOnFail ? 'Yes' : 'No', inline: true },
        { name: '👤 Allow Same User', value: allowSameUser ? 'Yes' : 'No', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
