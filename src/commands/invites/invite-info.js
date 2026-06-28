import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('invite-info')
    .setDescription('Get information about an invite code')
    .addStringOption(o => o.setName('code').setDescription('Invite code').setRequired(true)),

  name: 'invite-info',
  description: 'Get information about an invite code',

  async execute(interaction, client) {
    const code = interaction.options.getString('code').replace('https://discord.gg/', '');

    const invite = await client.fetchInvite(code).catch(() => null);

    if (!invite) {
      return interaction.reply({ content: '❌ Invalid or expired invite code.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📨 Invite Information')
      .addFields(
        { name: '🔗 Code', value: invite.code, inline: true },
        { name: '🏠 Server', value: invite.guild?.name || 'Unknown', inline: true },
        { name: '📢 Channel', value: invite.channel?.name || 'Unknown', inline: true },
        { name: '👤 Inviter', value: invite.inviter?.tag || 'Unknown', inline: true },
        { name: '🔢 Uses', value: `${invite.uses || 0}${invite.maxUses ? ` / ${invite.maxUses}` : ''}`, inline: true },
        { name: '⏰ Expires', value: invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>` : 'Never', inline: true },
      )
      .setTimestamp();

    if (invite.guild?.iconURL()) embed.setThumbnail(invite.guild.iconURL());

    await interaction.reply({ embeds: [embed] });
  },
};
