import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reminder-config')
    .setDescription('Configure the reminder system')
    .addIntegerOption(o => o.setName('max_reminders').setDescription('Max reminders per user (default: 10)').setRequired(false).setMinValue(1).setMaxValue(50))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'reminder-config',
  description: 'Configure the reminder system',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const maxReminders = interaction.options.getInteger('max_reminders') || 10;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('⚙️ Reminder Configuration')
      .addFields(
        { name: '📊 Max Reminders per User', value: `${maxReminders}`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
