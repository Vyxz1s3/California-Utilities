import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('raid-threshold')
    .setDescription('Set the raid detection threshold (joins per 10 seconds)')
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('Number of joins before triggering anti-raid (2–50)')
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(50)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'raid-threshold',
  description: 'Set raid threshold',

  async execute(interaction, client) {
    const threshold = interaction.options.getInteger('number');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You do not have permission to manage guild settings.', ephemeral: true });
    }

    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);
    await query(
      `INSERT INTO guild_settings (guild_id, raid_threshold) VALUES ($1, $2)
       ON CONFLICT (guild_id) DO UPDATE SET raid_threshold = $2`,
      [interaction.guild.id, threshold]
    );

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('⚙️ Raid Threshold Updated')
      .setDescription(`Raid threshold set to **${threshold} joins per 10 seconds**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
