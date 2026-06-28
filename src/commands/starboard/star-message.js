import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('star-message')
    .setDescription('Manually star a message')
    .addStringOption(o => o.setName('message_id').setDescription('Message ID to star').setRequired(true)),

  name: 'star-message',
  description: 'Manually star a message',

  async execute(interaction, client) {
    const messageId = interaction.options.getString('message_id');
    const msg = await interaction.channel.messages.fetch(messageId).catch(() => null);

    if (!msg) {
      return interaction.reply({ content: '❌ Message not found in this channel.', ephemeral: true });
    }

    await query(
      `INSERT INTO starboard_messages (guild_id, channel_id, message_id, author_id, star_count)
       VALUES ($1, $2, $3, $4, 1)
       ON CONFLICT (message_id) DO UPDATE SET star_count = starboard_messages.star_count + 1`,
      [interaction.guild.id, interaction.channel.id, messageId, msg.author.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('⭐ Message Starred')
      .setDescription(`Message by ${msg.author.tag} has been starred.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
