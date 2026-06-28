import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, PermissionsBitField } from 'discord.js';

function parseDuration(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
}

export default {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock down the current channel')
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Auto-unlock after duration (e.g. 10m, 1h) — optional')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  name: 'lockdown',
  description: 'Lock down a channel',

  async execute(interaction, client) {
    const durationStr = interaction.options.getString('duration');

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.reply({ content: '❌ You do not have permission to manage channels.', ephemeral: true });
    }

    const everyoneRole = interaction.guild.roles.everyone;
    await interaction.channel.permissionOverwrites.edit(everyoneRole, {
      SendMessages: false,
    });

    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('🔒 Channel Locked')
      .setDescription(`${interaction.channel} has been locked down.`)
      .addFields({ name: 'Locked by', value: interaction.user.tag, inline: true })
      .setTimestamp();

    if (durationStr) {
      const durationMs = parseDuration(durationStr);
      if (durationMs) {
        embed.addFields({ name: 'Auto-unlock in', value: durationStr, inline: true });
        setTimeout(async () => {
          await interaction.channel.permissionOverwrites.edit(everyoneRole, {
            SendMessages: null,
          });
          await interaction.channel.send('🔓 Channel has been automatically unlocked.');
        }, durationMs);
      }
    }

    await interaction.reply({ embeds: [embed] });
  },
};
