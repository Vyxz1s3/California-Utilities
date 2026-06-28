import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('birthdays')
    .setDescription('View upcoming birthdays in this server'),

  name: 'birthdays',
  description: 'View upcoming birthdays in this server',

  async execute(interaction, client) {
    const result = await query(
      `SELECT * FROM birthdays WHERE guild_id = $1
       ORDER BY
         CASE WHEN EXTRACT(MONTH FROM birthday) >= EXTRACT(MONTH FROM NOW())
              THEN EXTRACT(MONTH FROM birthday)
              ELSE EXTRACT(MONTH FROM birthday) + 12
         END,
         EXTRACT(DAY FROM birthday)
       LIMIT 10`,
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const embed = new EmbedBuilder()
      .setColor(0xFF69B4)
      .setTitle('🎂 Upcoming Birthdays')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No birthdays set. Use `/birthday-set` to add yours!');
    } else {
      const lines = result.rows.map(b => {
        const d = new Date(b.birthday);
        return `<@${b.user_id}> — **${months[d.getMonth()]} ${d.getDate()}**${b.year_known ? `, ${d.getFullYear()}` : ''}`;
      }).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
