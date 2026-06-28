import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('permissions')
    .setDescription('View or check permissions for a role or user')
    .addRoleOption(o => o.setName('role').setDescription('Role to check permissions for').setRequired(false))
    .addUserOption(o => o.setName('user').setDescription('User to check permissions for').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'permissions',
  description: 'View or check permissions for a role or user',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const role = interaction.options.getRole('role');
    const user = interaction.options.getUser('user');

    let perms, name;

    if (role) {
      perms = role.permissions;
      name = role.name;
    } else if (user) {
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!member) return interaction.reply({ content: '❌ Member not found.', ephemeral: true });
      perms = member.permissions;
      name = user.tag;
    } else {
      return interaction.reply({ content: '❌ Please specify a role or user.', ephemeral: true });
    }

    const permList = perms.toArray().map(p => `\`${p}\``).join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🔐 Permissions — ${name}`)
      .setDescription(permList.length > 2000 ? permList.slice(0, 1997) + '...' : permList)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
