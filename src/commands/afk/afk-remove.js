import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('afk-remove')
    .setDescription('Remove a user\'s AFK status')
    .addUserOption(o => o.setName('user').setDescription('User to remove AFK from (default: yourself)').setRequired(false)),

  name: 'afk-remove',
  description: 'Remove a user\'s AFK status',

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;

    if (target.id !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You can only remove your own AFK status.', ephemeral: true });
    }

    await query(
      'DELETE FROM afk_users WHERE guild_id = $1 AND user_id = $2',
      [interaction.guild.id, target.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ AFK Removed')
      .setDescription(`${target.tag}'s AFK status has been removed.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
