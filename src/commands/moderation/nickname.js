import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription("Change a user's nickname")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to nickname')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('nickname')
        .setDescription('New nickname (max 32 characters)')
        .setRequired(true)
        .setMaxLength(32)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  name: 'nickname',
  description: "Change a user's nickname",

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction.reply({ content: '❌ You do not have permission to manage nicknames.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });

    if (!member.manageable) {
      return interaction.reply({ content: '❌ I cannot change this user\'s nickname.', ephemeral: true });
    }

    const oldNick = member.nickname || member.user.username;
    await member.setNickname(nickname);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('✏️ Nickname Changed')
      .addFields(
        { name: 'User', value: `${user.tag}`, inline: true },
        { name: 'Old Nickname', value: oldNick, inline: true },
        { name: 'New Nickname', value: nickname, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
