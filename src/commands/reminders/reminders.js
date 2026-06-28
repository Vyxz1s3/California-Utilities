import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reminders')
    .setDescription('View your active reminders'),

  name: 'reminders',
  description: 'View your active reminders',

  async execute(interaction, client) {
    const result = await query(
      'SELECT * FROM reminders WHERE user_id = $1 AND remind_at > NOW() ORDER BY remind_at ASC LIMIT 10',
      [interaction.user.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('⏰ Your Reminders')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('You have no active reminders. Use `/remind` to set one!');
    } else {
      const lines = result.rows.map((r, i) =>
        `**#${r.id}** — ${r.content}\n⏱️ <t:${Math.floor(new Date(r.remind_at).getTime() / 1000)}:R>`
      ).join('\n\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
