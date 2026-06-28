import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('role-position')
    .setDescription('Change the position of a role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to reposition')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription('New position (1 = bottom)')
        .setRequired(true)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  name: 'role-position',
  description: 'Change role position',

  async execute(interaction, client) {
    const role = interaction.options.getRole('role');
    const position = interaction.options.getInteger('position');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ You do not have permission to manage roles.', ephemeral: true });
    }

    if (!role.editable) {
      return interaction.reply({ content: '❌ I cannot edit this role.', ephemeral: true });
    }

    const oldPosition = role.position;
    await role.setPosition(position);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('📊 Role Position Updated')
      .addFields(
        { name: 'Role', value: `${role}`, inline: true },
        { name: 'Old Position', value: `${oldPosition}`, inline: true },
        { name: 'New Position', value: `${position}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
