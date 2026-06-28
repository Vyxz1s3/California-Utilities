import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('spam-threshold')
    .setDescription('Set the spam detection threshold (messages per 5 seconds)')
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('Number of messages before triggering anti-spam (2–20)')
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(20)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'spam-threshold',
  description: 'Set spam threshold',

  async execute(interaction, client) {
    const threshold = interaction.options.getInteger('number');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You do not have permission to manage guild settings.', ephemeral: true });
    }

    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);
    await query(
      `INSERT INTO guild_settings (guild_id, spam_threshold) VALUES ($1, $2)
       ON CONFLICT (guild_id) DO UPDATE SET spam_threshold = $2`,
      [interaction.guild.id, threshold]
    );

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('⚙️ Spam Threshold Updated')
      .setDescription(`Spam threshold set to **${threshold} messages per 5 seconds**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
