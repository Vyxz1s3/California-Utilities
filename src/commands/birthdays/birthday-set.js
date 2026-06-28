import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('birthday-set')
    .setDescription('Set your birthday')
    .addIntegerOption(o => o.setName('day').setDescription('Day (1–31)').setRequired(true).setMinValue(1).setMaxValue(31))
    .addIntegerOption(o => o.setName('month').setDescription('Month (1–12)').setRequired(true).setMinValue(1).setMaxValue(12))
    .addIntegerOption(o => o.setName('year').setDescription('Year (optional)').setRequired(false).setMinValue(1900).setMaxValue(new Date().getFullYear())),

  name: 'birthday-set',
  description: 'Set your birthday',

  async execute(interaction, client) {
    const day = interaction.options.getInteger('day');
    const month = interaction.options.getInteger('month');
    const year = interaction.options.getInteger('year');

    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    const birthdayDate = year
      ? new Date(year, month - 1, day)
      : new Date(2000, month - 1, day);

    await query(
      `INSERT INTO birthdays (guild_id, user_id, birthday, year_known)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (guild_id, user_id) DO UPDATE SET birthday = $3, year_known = $4`,
      [interaction.guild.id, interaction.user.id, birthdayDate, !!year]
    ).catch(() => {});

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const embed = new EmbedBuilder()
      .setColor(0xFF69B4)
      .setTitle('🎂 Birthday Set!')
      .setDescription(`Your birthday has been set to **${months[month - 1]} ${day}${year ? `, ${year}` : ''}**!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
