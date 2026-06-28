import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user\'s avatar')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to get avatar for')
        .setRequired(false)
    ),

  name: 'avatar',
  description: 'Get a user\'s avatar',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ size: 4096, extension: 'png' });

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🖼️ ${user.username}'s Avatar`)
      .setImage(avatarUrl)
      .addFields(
        { name: '🔗 PNG', value: `[Download](${user.displayAvatarURL({ size: 4096, extension: 'png' })})`, inline: true },
        { name: '🔗 WebP', value: `[Download](${user.displayAvatarURL({ size: 4096, extension: 'webp' })})`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
