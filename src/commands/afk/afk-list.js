import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('afk-list')
    .setDescription('View all AFK members in this server'),

  name: 'afk-list',
  description: 'View all AFK members in this server',

  async execute(interaction, client) {
    const result = await query(
      'SELECT * FROM afk_users WHERE guild_id = $1 ORDER BY set_at DESC',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('💤 AFK Members')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No members are currently AFK.');
    } else {
      const lines = result.rows.map(a =>
        `<@${a.user_id}> — ${a.reason} (<t:${Math.floor(new Date(a.set_at).getTime() / 1000)}:R>)`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
