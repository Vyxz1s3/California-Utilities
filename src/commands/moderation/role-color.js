import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('role-color')
    .setDescription('Change the color of a role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to recolor')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('color')
        .setDescription('New color as hex (e.g. #ff0000)')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  name: 'role-color',
  description: 'Change role color',

  async execute(interaction, client) {
    const role = interaction.options.getRole('role');
    const colorInput = interaction.options.getString('color');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ You do not have permission to manage roles.', ephemeral: true });
    }

    const hex = colorInput.replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
      return interaction.reply({ content: '❌ Invalid color. Use a hex code like `#ff0000`.', ephemeral: true });
    }

    if (!role.editable) {
      return interaction.reply({ content: '❌ I cannot edit this role.', ephemeral: true });
    }

    const oldColor = role.hexColor;
    await role.setColor(parseInt(hex, 16));

    const embed = new EmbedBuilder()
      .setColor(parseInt(hex, 16))
      .setTitle('🎨 Role Color Updated')
      .addFields(
        { name: 'Role', value: `${role}`, inline: true },
        { name: 'Old Color', value: oldColor, inline: true },
        { name: 'New Color', value: `#${hex}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
