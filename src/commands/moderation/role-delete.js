import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('role-delete')
    .setDescription('Delete a role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to delete')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  name: 'role-delete',
  description: 'Delete a role',

  async execute(interaction, client) {
    const role = interaction.options.getRole('role');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ You do not have permission to manage roles.', ephemeral: true });
    }

    if (!role.editable) {
      return interaction.reply({ content: '❌ I cannot delete this role (it may be higher than my highest role).', ephemeral: true });
    }

    const roleName = role.name;
    await role.delete(`Deleted by ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🗑️ Role Deleted')
      .addFields(
        { name: 'Role', value: roleName, inline: true },
        { name: 'Deleted by', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
