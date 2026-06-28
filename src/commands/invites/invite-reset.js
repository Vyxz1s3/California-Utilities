import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('invite-reset')
    .setDescription('Reset invite count for a user')
    .addUserOption(o => o.setName('user').setDescription('User to reset invites for').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'invite-reset',
  description: 'Reset invite count for a user',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');

    await query(
      'DELETE FROM invite_tracking WHERE guild_id = $1 AND inviter_id = $2',
      [interaction.guild.id, user.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🔄 Invites Reset')
      .setDescription(`Invite count for ${user.tag} has been reset to **0**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
