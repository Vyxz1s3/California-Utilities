import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { addWarning } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to warn')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for warning')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  name: 'warn',
  description: 'Warn a user',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({
        content: '❌ You do not have permission to warn users.',
        ephemeral: true,
      });
    }

    const warnings = await addWarning(interaction.guild.id, user.id, reason);

    await interaction.reply(
      `⚠️ **${user.username}** has been warned.\n**Reason:** ${reason}\n**Total Warnings:** ${warnings}`
    );
  },
};

