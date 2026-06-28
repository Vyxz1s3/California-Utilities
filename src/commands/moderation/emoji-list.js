import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('emoji-list')
    .setDescription('List all server emojis')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers),

  name: 'emoji-list',
  description: 'List all server emojis',

  async execute(interaction, client) {
    const emojis = interaction.guild.emojis.cache;

    if (emojis.size === 0) {
      return interaction.reply({ content: '❌ This server has no custom emojis.', ephemeral: true });
    }

    const staticEmojis = emojis.filter(e => !e.animated);
    const animatedEmojis = emojis.filter(e => e.animated);

    const formatList = (collection) =>
      collection.size > 0
        ? collection.map(e => `${e} \`:${e.name}:\``).join('\n').slice(0, 1024)
        : 'None';

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`😀 Server Emojis — ${interaction.guild.name}`)
      .addFields(
        { name: `Static (${staticEmojis.size})`, value: formatList(staticEmojis) },
        { name: `Animated (${animatedEmojis.size})`, value: formatList(animatedEmojis) }
      )
      .setFooter({ text: `${emojis.size} total emoji(s)` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
