import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('verify-embed')
    .setDescription('Send a verification embed to the current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'verify-embed',
  description: 'Send a verification embed to the current channel',

  async execute(interaction) {
    // Create the verification embed
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎮 Roblox Account Verification')
      .setDescription(
        'Verify your Roblox account to unlock access to this server!\n\n' +
        'This is a **secure verification process** that proves you own your Roblox account.'
      )
      .addFields(
        {
          name: '📋 How It Works',
          value:
            '**Step 1:** Click the "Click to verify" button below\n' +
            '**Step 2:** Run `/verify start <your_roblox_username>`\n' +
            '**Step 3:** Copy the verification code provided\n' +
            '**Step 4:** Go to your Roblox profile and paste the code in your **About** section\n' +
            '**Step 5:** Run `/verify confirm <your_roblox_username>`\n' +
            '**Step 6:** Get verified and enjoy the server! ✅',
          inline: false,
        },
        {
          name: '⚠️ Important Notes',
          value:
            '• Your Roblox username must be **exact** (case-sensitive)\n' +
            '• You have **10 minutes** to complete verification after getting a code\n' +
            '• You can remove the code from your bio after verification\n' +
            '• This process is **secure** — we never ask for passwords',
          inline: false,
        },
        {
          name: '❓ Need Help?',
          value:
            'If you have any issues with verification, please contact a server moderator or admin.',
          inline: false,
        }
      )
      .setThumbnail('https://www.roblox.com/favicon.ico')
      .setFooter({ text: 'Secure Roblox Verification System' })
      .setTimestamp();

    // Create the button
    const button = new ButtonBuilder()
      .setCustomId('verify_start_button')
      .setLabel('Click to Verify')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅');

    // Create action row with button
    const row = new ActionRowBuilder().addComponents(button);

    // Send the embed with button
    await interaction.channel.send({ embeds: [embed], components: [row] });

    // Reply to the command
    await interaction.reply({
      content: '✅ Verification embed sent!',
      ephemeral: true,
    });
  },
};

