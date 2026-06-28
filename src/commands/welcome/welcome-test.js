import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('welcome-test')
    .setDescription('Test the welcome message')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'welcome-test',
  description: 'Test the welcome message',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM guild_settings WHERE guild_id = $1',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const settings = result.rows[0];

    if (!settings?.welcome_message) {
      return interaction.reply({ content: '❌ No welcome message configured. Use `/welcome-message` first.', ephemeral: true });
    }

    const preview = settings.welcome_message
      .replace('{user}', interaction.user.toString())
      .replace('{server}', interaction.guild.name)
      .replace('{count}', interaction.guild.memberCount.toString());

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('🧪 Welcome Message Test')
      .setDescription(preview)
      .setFooter({ text: 'This is a preview of your welcome message' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
