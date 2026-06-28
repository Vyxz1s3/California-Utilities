import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('member-list')
    .setDescription('List members, optionally filtered by role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Filter members by role')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'member-list',
  description: 'List members (optionally by role)',

  async execute(interaction, client) {
    const role = interaction.options.getRole('role');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to list members.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    // Fetch all members
    const members = await interaction.guild.members.fetch();
    const filtered = role
      ? members.filter(m => m.roles.cache.has(role.id))
      : members;

    if (filtered.size === 0) {
      return interaction.editReply({ content: role ? `❌ No members found with the role ${role}.` : '❌ No members found.' });
    }

    const list = filtered
      .map(m => `${m.user.tag} (${m.id})`)
      .slice(0, 50)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(role ? `👥 Members with ${role.name}` : `👥 All Members`)
      .setDescription(`\`\`\`\n${list}\n\`\`\``)
      .setFooter({ text: `Showing ${Math.min(filtered.size, 50)} of ${filtered.size} member(s)` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
