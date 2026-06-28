import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

function parseDuration(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const val = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return val * multipliers[unit];
}

export default {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder')
    .addStringOption(o => o.setName('time').setDescription('When to remind you (e.g. 10m, 1h, 2d)').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('What to remind you about').setRequired(true)),

  name: 'remind',
  description: 'Set a reminder',

  async execute(interaction, client) {
    const timeStr = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    const ms = parseDuration(timeStr);

    if (!ms) {
      return interaction.reply({ content: '❌ Invalid time format. Use `10s`, `5m`, `2h`, or `1d`.', ephemeral: true });
    }

    if (ms > 30 * 24 * 60 * 60 * 1000) {
      return interaction.reply({ content: '❌ Maximum reminder duration is 30 days.', ephemeral: true });
    }

    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);
    const remindAt = new Date(Date.now() + ms);

    await query(
      'INSERT INTO reminders (user_id, guild_id, content, remind_at) VALUES ($1, $2, $3, $4)',
      [interaction.user.id, interaction.guild.id, message, remindAt]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('⏰ Reminder Set')
      .addFields(
        { name: '📝 Message', value: message, inline: false },
        { name: '⏱️ Remind At', value: `<t:${Math.floor(remindAt.getTime() / 1000)}:F> (<t:${Math.floor(remindAt.getTime() / 1000)}:R>)`, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
