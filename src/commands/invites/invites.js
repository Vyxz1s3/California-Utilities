import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('View invite statistics for a user')
    .addUserOption(o => o.setName('user').setDescription('User to check (default: yourself)').setRequired(false)),

  name: 'invites',
  description: 'View invite statistics for a user',

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;

    const result = await query(
      'SELECT * FROM invite_tracking WHERE guild_id = $1 AND inviter_id = $2',
      [interaction.guild.id, target.id]
    ).catch(() => ({ rows: [] }));

    const total = result.rows.reduce((sum, r) => sum + (r.uses || 0), 0);
    const left = result.rows.reduce((sum, r) => sum + (r.left_count || 0), 0);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`📨 Invites — ${target.username}`)
      .addFields(
        { name: '✅ Total Invites', value: `${total}`, inline: true },
        { name: '🚪 Left', value: `${left}`, inline: true },
        { name: '📊 Net', value: `${total - left}`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
