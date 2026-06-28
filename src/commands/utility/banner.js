import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Get a user\'s profile banner')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to get banner for')
        .setRequired(false)
    ),

  name: 'banner',
  description: 'Get a user\'s profile banner',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const fetched = await user.fetch();
    const bannerUrl = fetched.bannerURL({ size: 4096 });

    if (!bannerUrl) {
      return interaction.reply({ content: `❌ **${user.username}** does not have a profile banner.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🖼️ ${user.username}'s Banner`)
      .setImage(bannerUrl)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
