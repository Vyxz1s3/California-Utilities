import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('role-create')
    .setDescription('Create a new role')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name of the new role')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Role color as hex (e.g. #ff0000)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  name: 'role-create',
  description: 'Create a role',

  async execute(interaction, client) {
    const name = interaction.options.getString('name');
    const colorInput = interaction.options.getString('color');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ You do not have permission to manage roles.', ephemeral: true });
    }

    const roleOptions = { name };
    if (colorInput) {
      const hex = colorInput.replace('#', '');
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        return interaction.reply({ content: '❌ Invalid color. Use a hex code like `#ff0000`.', ephemeral: true });
      }
      roleOptions.color = parseInt(hex, 16);
    }

    const role = await interaction.guild.roles.create(roleOptions);

    const embed = new EmbedBuilder()
      .setColor(role.color || 0x99aab5)
      .setTitle('✅ Role Created')
      .addFields(
        { name: 'Role', value: `${role}`, inline: true },
        { name: 'Color', value: role.hexColor, inline: true },
        { name: 'Created by', value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
