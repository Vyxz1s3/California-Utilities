import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('poll-results')
    .setDescription('View the results of a poll')
    .addStringOption(o => o.setName('message_id').setDescription('Poll message ID').setRequired(true)),

  name: 'poll-results',
  description: 'View the results of a poll',

  async execute(interaction, client) {
    const messageId = interaction.options.getString('message_id');

    const result = await query(
      'SELECT * FROM polls WHERE guild_id = $1 AND message_id = $2',
      [interaction.guild.id, messageId]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: '❌ Poll not found.', ephemeral: true });
    }

    const poll = result.rows[0];
    const options = JSON.parse(poll.options);

    const msg = await interaction.channel.messages.fetch(messageId).catch(() => null);
    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    let voteCounts = options.map(() => 0);
    if (msg) {
      for (let i = 0; i < options.length; i++) {
        const reaction = msg.reactions.cache.get(numberEmojis[i]);
        if (reaction) voteCounts[i] = reaction.count - 1;
      }
    }

    const total = voteCounts.reduce((a, b) => a + b, 0);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`📊 Poll Results — ${poll.question}`)
      .setDescription(options.map((o, i) => {
        const pct = total > 0 ? Math.round((voteCounts[i] / total) * 100) : 0;
        const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
        return `${numberEmojis[i]} **${o}**\n\`${bar}\` ${voteCounts[i]} votes (${pct}%)`;
      }).join('\n\n'))
      .addFields({ name: '🗳️ Total Votes', value: `${total}`, inline: true })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
