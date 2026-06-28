import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set your AFK status')
    .addStringOption(o => o.setName('reason').setDescription('AFK reason').setRequired(false)),

  name: 'afk',
  description: 'Set your AFK status',

  async execute(interaction, client) {
    const reason = interaction.options.getString('reason') || 'AFK';
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    await query(
      `INSERT INTO afk_users (guild_id, user_id, reason, set_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (guild_id, user_id) DO UPDATE SET reason = $3, set_at = NOW()`,
      [interaction.guild.id, interaction.user.id, reason]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('💤 AFK Status Set')
      .setDescription(`You are now AFK: **${reason}**`)
      .setFooter({ text: 'Your AFK will be removed when you send a message' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
