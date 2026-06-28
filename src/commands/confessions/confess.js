import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('confess')
    .setDescription('Submit an anonymous confession')
    .addStringOption(o => o.setName('confession').setDescription('Your confession').setRequired(true)),

  name: 'confess',
  description: 'Submit an anonymous confession',

  async execute(interaction, client) {
    const confession = interaction.options.getString('confession');
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    const result = await query(
      `INSERT INTO confessions (guild_id, user_id, content, status)
       VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [interaction.guild.id, interaction.user.id, confession]
    ).catch(() => ({ rows: [] }));

    const id = result.rows[0]?.id || '?';

    await interaction.reply({ content: `✅ Your confession (#${id}) has been submitted anonymously and is pending review.`, ephemeral: true });
  },
};
