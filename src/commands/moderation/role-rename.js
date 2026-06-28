import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('role-rename')
    .setDescription('Rename a role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to rename')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('new_name')
        .setDescription('New name for the role')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  name: 'role-rename',
  description: 'Rename a role',

  async execute(interaction, client) {
    const role = interaction.options.getRole('role');
    const newName = interaction.options.getString('new_name');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ You do not have permission to manage roles.', ephemeral: true });
    }

    if (!role.editable) {
      return interaction.reply({ content: '❌ I cannot edit this role.', ephemeral: true });
    }

    const oldName = role.name;
    await role.setName(newName);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('✏️ Role Renamed')
      .addFields(
        { name: 'Old Name', value: oldName, inline: true },
        { name: 'New Name', value: newName, inline: true },
        { name: 'Renamed by', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
