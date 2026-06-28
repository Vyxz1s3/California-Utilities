import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('auto-response-add')
    .setDescription('Add an automatic response trigger')
    .addStringOption(o => o.setName('trigger').setDescription('Trigger phrase').setRequired(true))
    .addStringOption(o => o.setName('response').setDescription('Response to send').setRequired(true))
    .addBooleanOption(o => o.setName('exact').setDescription('Exact match only (default: false)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'auto-response-add',
  description: 'Add an automatic response trigger',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const trigger = interaction.options.getString('trigger');
    const response = interaction.options.getString('response');
    const exact = interaction.options.getBoolean('exact') ?? false;

    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    await query(
      'INSERT INTO auto_responses (guild_id, trigger, response, exact_match, created_by) VALUES ($1, $2, $3, $4, $5)',
      [interaction.guild.id, trigger.toLowerCase(), response, exact, interaction.user.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Auto Response Added')
      .addFields(
        { name: '🔍 Trigger', value: `\`${trigger}\``, inline: true },
        { name: '💬 Response', value: response.slice(0, 100), inline: false },
        { name: '🎯 Exact Match', value: exact ? 'Yes' : 'No', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
