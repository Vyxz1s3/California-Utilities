import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('invite-logs')
    .setDescription('View invite tracking logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'invite-logs',
  description: 'View invite tracking logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM invite_tracking WHERE guild_id = $1 ORDER BY uses DESC LIMIT 10',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 Invite Logs')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No invite data found.');
    } else {
      const lines = result.rows.map((r, i) =>
        `**#${i + 1}** — <@${r.inviter_id}> | Code: \`${r.invite_code}\` | Uses: ${r.uses}`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
