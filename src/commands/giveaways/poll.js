import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true))
    .addStringOption(o => o.setName('options').setDescription('Options separated by | (e.g. Yes|No|Maybe)').setRequired(true))
    .addIntegerOption(o => o.setName('duration').setDescription('Duration in minutes (default: 60)').setRequired(false).setMinValue(1).setMaxValue(10080)),

  name: 'poll',
  description: 'Create a poll',

  async execute(interaction, client) {
    const question = interaction.options.getString('question');
    const optionsRaw = interaction.options.getString('options').split('|').map(o => o.trim()).filter(Boolean);
    const duration = interaction.options.getInteger('duration') || 60;

    if (optionsRaw.length < 2 || optionsRaw.length > 10) {
      return interaction.reply({ content: '❌ Please provide between 2 and 10 options separated by `|`.', ephemeral: true });
    }

    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    const endsAt = new Date(Date.now() + duration * 60 * 1000);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`📊 ${question}`)
      .setDescription(optionsRaw.map((o, i) => `${numberEmojis[i]} ${o}`).join('\n'))
      .addFields(
        { name: '⏰ Ends', value: `<t:${Math.floor(endsAt.getTime() / 1000)}:R>`, inline: true },
        { name: '👤 Created by', value: interaction.user.tag, inline: true },
      )
      .setFooter({ text: 'React with the number to vote!' })
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (let i = 0; i < optionsRaw.length; i++) {
      await msg.react(numberEmojis[i]).catch(() => {});
    }

    await query(
      `INSERT INTO polls (guild_id, channel_id, message_id, question, options, created_by, ends_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [interaction.guild.id, interaction.channel.id, msg.id, question, JSON.stringify(optionsRaw), interaction.user.id, endsAt]
    ).catch(() => {});
  },
};
