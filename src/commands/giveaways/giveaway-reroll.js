import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway-reroll')
    .setDescription('Reroll the winners of an ended giveaway')
    .addStringOption(o => o.setName('message_id').setDescription('Giveaway message ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'giveaway-reroll',
  description: 'Reroll the winners of an ended giveaway',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const messageId = interaction.options.getString('message_id');
    const msg = await interaction.channel.messages.fetch(messageId).catch(() => null);

    if (!msg) {
      return interaction.reply({ content: '❌ Message not found.', ephemeral: true });
    }

    const reaction = msg.reactions.cache.get('🎉');
    let winnerMentions = 'No entries found.';

    if (reaction) {
      const users = await reaction.users.fetch();
      const entries = users.filter(u => !u.bot).map(u => u);
      if (entries.length > 0) {
        const winner = entries[Math.floor(Math.random() * entries.length)];
        winnerMentions = `<@${winner.id}>`;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🎉 Giveaway Rerolled!')
      .setDescription(`New winner: ${winnerMentions}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
