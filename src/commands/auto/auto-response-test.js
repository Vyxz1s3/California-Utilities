import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('auto-response-test')
    .setDescription('Test if a message would trigger an auto response')
    .addStringOption(o => o.setName('message').setDescription('Message to test').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'auto-response-test',
  description: 'Test if a message would trigger an auto response',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const message = interaction.options.getString('message').toLowerCase();

    const result = await query(
      'SELECT * FROM auto_responses WHERE guild_id = $1',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const match = result.rows.find(r =>
      r.exact_match ? r.trigger === message : message.includes(r.trigger)
    );

    const embed = new EmbedBuilder()
      .setColor(match ? 0x2ECC71 : 0xE74C3C)
      .setTitle('🧪 Auto Response Test')
      .addFields(
        { name: '📨 Message', value: `\`${message}\``, inline: false },
        { name: '🎯 Match Found', value: match ? 'Yes' : 'No', inline: true },
      );

    if (match) {
      embed.addFields(
        { name: '🔍 Trigger', value: `\`${match.trigger}\``, inline: true },
        { name: '💬 Response', value: match.response.slice(0, 200), inline: false },
      );
    }

    embed.setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
