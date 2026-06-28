import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion for the server')
    .addStringOption(o => o.setName('suggestion').setDescription('Your suggestion').setRequired(true)),

  name: 'suggest',
  description: 'Submit a suggestion for the server',

  async execute(interaction, client) {
    const suggestion = interaction.options.getString('suggestion');
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    const result = await query(
      `INSERT INTO suggestions (guild_id, user_id, content, status)
       VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [interaction.guild.id, interaction.user.id, suggestion]
    ).catch(() => ({ rows: [] }));

    const id = result.rows[0]?.id || '?';

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`💡 Suggestion #${id}`)
      .setDescription(suggestion)
      .addFields(
        { name: '👤 Submitted by', value: interaction.user.tag, inline: true },
        { name: '📊 Status', value: '⏳ Pending', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
