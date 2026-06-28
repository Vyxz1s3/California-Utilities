import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('View the last deleted message in this channel'),

  name: 'snipe',
  description: 'View the last deleted message in this channel',

  async execute(interaction, client) {
    const snipeCache = client.snipeCache || new Map();
    const cached = snipeCache.get(interaction.channel.id);

    if (!cached) {
      return interaction.reply({ content: '❌ No recently deleted messages found in this channel.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🔍 Sniped Message')
      .setDescription(cached.content || '*[No text content]*')
      .setAuthor({ name: cached.author.tag, iconURL: cached.author.displayAvatarURL() })
      .setFooter({ text: `Deleted in #${interaction.channel.name}` })
      .setTimestamp(cached.deletedAt);

    if (cached.attachments?.length) {
      embed.setImage(cached.attachments[0]);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
