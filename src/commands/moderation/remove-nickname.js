import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remove-nickname')
    .setDescription("Remove a user's nickname")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove nickname from')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

  name: 'remove-nickname',
  description: "Remove a user's nickname",

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction.reply({ content: '❌ You do not have permission to manage nicknames.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });

    if (!member.manageable) {
      return interaction.reply({ content: '❌ I cannot change this user\'s nickname.', ephemeral: true });
    }

    if (!member.nickname) {
      return interaction.reply({ content: '❌ This user does not have a nickname.', ephemeral: true });
    }

    const oldNick = member.nickname;
    await member.setNickname(null);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('✅ Nickname Removed')
      .addFields(
        { name: 'User', value: `${user.tag}`, inline: true },
        { name: 'Removed Nickname', value: oldNick, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
