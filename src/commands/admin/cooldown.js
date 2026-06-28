import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('cooldown')
    .setDescription('Set a custom cooldown for a command')
    .addStringOption(o => o.setName('command').setDescription('Command name').setRequired(true))
    .addIntegerOption(o => o.setName('seconds').setDescription('Cooldown in seconds (0 to remove)').setRequired(true).setMinValue(0).setMaxValue(3600))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'cooldown',
  description: 'Set a custom cooldown for a command',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const command = interaction.options.getString('command');
    const seconds = interaction.options.getInteger('seconds');

    if (!client.commands.has(command)) {
      return interaction.reply({ content: `❌ Command \`${command}\` not found.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('⏱️ Cooldown Set')
      .addFields(
        { name: '⚡ Command', value: `\`/${command}\``, inline: true },
        { name: '⏰ Cooldown', value: seconds === 0 ? 'Removed' : `${seconds} seconds`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
