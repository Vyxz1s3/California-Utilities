import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway-create')
    .setDescription('Create a giveaway')
    .addStringOption(o => o.setName('prize').setDescription('What are you giving away?').setRequired(true))
    .addIntegerOption(o => o.setName('duration').setDescription('Duration in minutes').setRequired(true).setMinValue(1).setMaxValue(43200))
    .addIntegerOption(o => o.setName('winners').setDescription('Number of winners (default: 1)').setRequired(false).setMinValue(1).setMaxValue(20))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'giveaway-create',
  description: 'Create a giveaway',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const prize = interaction.options.getString('prize');
    const duration = interaction.options.getInteger('duration');
    const winners = interaction.options.getInteger('winners') || 1;
    const endsAt = new Date(Date.now() + duration * 60 * 1000);

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🎉 GIVEAWAY 🎉')
      .setDescription(`React with 🎉 to enter!\n\n**Prize:** ${prize}`)
      .addFields(
        { name: '🏆 Winners', value: `${winners}`, inline: true },
        { name: '⏰ Ends', value: `<t:${Math.floor(endsAt.getTime() / 1000)}:R>`, inline: true },
        { name: '👤 Hosted by', value: interaction.user.tag, inline: true },
      )
      .setTimestamp(endsAt);

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('🎉').catch(() => {});

    await query(
      `INSERT INTO giveaways (guild_id, channel_id, message_id, prize, winners, hosted_by, ends_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [interaction.guild.id, interaction.channel.id, msg.id, prize, winners, interaction.user.id, endsAt, 'active']
    ).catch(() => {});
  },
};
