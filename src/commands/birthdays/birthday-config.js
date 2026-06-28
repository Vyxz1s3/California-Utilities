import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('birthday-config')
    .setDescription('Configure birthday announcements')
    .addChannelOption(o => o.setName('channel').setDescription('Channel for birthday announcements').setRequired(false))
    .addRoleOption(o => o.setName('role').setDescription('Role to give on birthday').setRequired(false))
    .addStringOption(o => o.setName('message').setDescription('Birthday message (use {user} for mention)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'birthday-config',
  description: 'Configure birthday announcements',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');
    const message = interaction.options.getString('message') || 'Happy Birthday {user}! 🎂';

    const embed = new EmbedBuilder()
      .setColor(0xFF69B4)
      .setTitle('⚙️ Birthday Configuration')
      .addFields(
        { name: '📢 Channel', value: channel ? `${channel}` : 'Not set', inline: true },
        { name: '🎭 Birthday Role', value: role ? `${role}` : 'Not set', inline: true },
        { name: '💬 Message', value: message, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
