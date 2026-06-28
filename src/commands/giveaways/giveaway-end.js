import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway-end')
    .setDescription('End a giveaway early and pick winners')
    .addStringOption(o => o.setName('message_id').setDescription('Giveaway message ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'giveaway-end',
  description: 'End a giveaway early and pick winners',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const messageId = interaction.options.getString('message_id');

    const result = await query(
      'SELECT * FROM giveaways WHERE guild_id = $1 AND message_id = $2',
      [interaction.guild.id, messageId]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: '❌ Giveaway not found.', ephemeral: true });
    }

    const giveaway = result.rows[0];
    const msg = await interaction.channel.messages.fetch(messageId).catch(() => null);

    let winnerMentions = 'No entries found.';
    if (msg) {
      const reaction = msg.reactions.cache.get('🎉');
      if (reaction) {
        const users = await reaction.users.fetch();
        const entries = users.filter(u => !u.bot).map(u => u);
        if (entries.length > 0) {
          const picked = entries.sort(() => Math.random() - 0.5).slice(0, giveaway.winners);
          winnerMentions = picked.map(u => `<@${u.id}>`).join(', ');
        }
      }
    }

    await query(
      'UPDATE giveaways SET status = $1, ended_at = NOW() WHERE message_id = $2',
      ['ended', messageId]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🎉 Giveaway Ended!')
      .addFields(
        { name: '🏆 Prize', value: giveaway.prize, inline: true },
        { name: '🥇 Winners', value: winnerMentions, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
