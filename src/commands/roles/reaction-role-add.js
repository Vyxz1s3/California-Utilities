import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reaction-role-add')
    .setDescription('Add a reaction role to a message')
    .addStringOption(o => o.setName('message_id').setDescription('Message ID').setRequired(true))
    .addStringOption(o => o.setName('emoji').setDescription('Emoji to react with').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  name: 'reaction-role-add',
  description: 'Add a reaction role to a message',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ You need Manage Roles permission.', ephemeral: true });
    }

    const messageId = interaction.options.getString('message_id');
    const emoji = interaction.options.getString('emoji');
    const role = interaction.options.getRole('role');

    await query(
      'INSERT INTO reaction_roles (guild_id, message_id, emoji, role_id) VALUES ($1, $2, $3, $4)',
      [interaction.guild.id, messageId, emoji, role.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Reaction Role Added')
      .addFields(
        { name: '📨 Message ID', value: messageId, inline: true },
        { name: '😀 Emoji', value: emoji, inline: true },
        { name: '🎭 Role', value: `${role}`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
