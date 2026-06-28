import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('snipe-edit')
    .setDescription('View the last edited message in this channel'),

  name: 'snipe-edit',
  description: 'View the last edited message in this channel',

  async execute(interaction, client) {
    const editSnipeCache = client.editSnipeCache || new Map();
    const cached = editSnipeCache.get(interaction.channel.id);

    if (!cached) {
      return interaction.reply({ content: '❌ No recently edited messages found in this channel.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('✏️ Edit Sniped Message')
      .addFields(
        { name: '📝 Before', value: cached.oldContent || '*[No text content]*', inline: false },
        { name: '📝 After', value: cached.newContent || '*[No text content]*', inline: false },
      )
      .setAuthor({ name: cached.author.tag, iconURL: cached.author.displayAvatarURL() })
      .setFooter({ text: `Edited in #${interaction.channel.name}` })
      .setTimestamp(cached.editedAt);

    await interaction.reply({ embeds: [embed] });
  },
};
