import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('prefix')
    .setDescription('Change the bot prefix for this server')
    .addStringOption(o => o.setName('prefix').setDescription('New prefix (1–5 characters)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'prefix',
  description: 'Change the bot prefix for this server',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const prefix = interaction.options.getString('prefix');

    if (prefix.length > 5) {
      return interaction.reply({ content: '❌ Prefix must be 5 characters or fewer.', ephemeral: true });
    }

    await query(
      'UPDATE guilds SET prefix = $1 WHERE id = $2',
      [prefix, interaction.guild.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Prefix Updated')
      .setDescription(`Bot prefix changed to \`${prefix}\``)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
