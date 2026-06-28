import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('confession-config')
    .setDescription('Configure the confession system')
    .addChannelOption(o => o.setName('channel').setDescription('Channel to post approved confessions').setRequired(false))
    .addBooleanOption(o => o.setName('moderation').setDescription('Require mod approval before posting').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'confession-config',
  description: 'Configure the confession system',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    const moderation = interaction.options.getBoolean('moderation') ?? true;

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('⚙️ Confession Configuration')
      .addFields(
        { name: '📢 Channel', value: channel ? `${channel}` : 'Not set', inline: true },
        { name: '🔍 Moderation', value: moderation ? 'Required' : 'Auto-approve', inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
