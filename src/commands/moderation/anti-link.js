import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('anti-link')
    .setDescription('Toggle anti-link protection')
    .addStringOption(option =>
      option.setName('state')
        .setDescription('Enable or disable anti-link')
        .setRequired(true)
        .addChoices(
          { name: 'Enable', value: 'enable' },
          { name: 'Disable', value: 'disable' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'anti-link',
  description: 'Toggle anti-link protection',

  async execute(interaction, client) {
    const state = interaction.options.getString('state') === 'enable';

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You do not have permission to manage guild settings.', ephemeral: true });
    }

    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);
    await query(
      `INSERT INTO guild_settings (guild_id, anti_link) VALUES ($1, $2)
       ON CONFLICT (guild_id) DO UPDATE SET anti_link = $2`,
      [interaction.guild.id, state]
    );

    const embed = new EmbedBuilder()
      .setColor(state ? 0x2ecc71 : 0xe74c3c)
      .setTitle(`🔗 Anti-Link ${state ? 'Enabled' : 'Disabled'}`)
      .setDescription(`Anti-link protection has been **${state ? 'enabled' : 'disabled'}**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
