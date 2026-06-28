import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unstar-message')
    .setDescription('Remove a message from the starboard')
    .addStringOption(o => o.setName('message_id').setDescription('Message ID to unstar').setRequired(true)),

  name: 'unstar-message',
  description: 'Remove a message from the starboard',

  async execute(interaction, client) {
    const messageId = interaction.options.getString('message_id');

    const result = await query(
      'DELETE FROM starboard_messages WHERE message_id = $1 AND guild_id = $2 RETURNING *',
      [messageId, interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: '❌ Message not found on the starboard.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🗑️ Message Unstarred')
      .setDescription(`Message \`${messageId}\` has been removed from the starboard.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
