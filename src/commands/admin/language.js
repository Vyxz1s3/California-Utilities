import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

const languages = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  nl: 'Dutch',
  it: 'Italian',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
};

export default {
  data: new SlashCommandBuilder()
    .setName('language')
    .setDescription('Set the bot language for this server')
    .addStringOption(o =>
      o.setName('language')
        .setDescription('Language to use')
        .setRequired(true)
        .addChoices(
          { name: '🇬🇧 English', value: 'en' },
          { name: '🇪🇸 Spanish', value: 'es' },
          { name: '🇫🇷 French', value: 'fr' },
          { name: '🇩🇪 German', value: 'de' },
          { name: '🇧🇷 Portuguese', value: 'pt' },
          { name: '🇳🇱 Dutch', value: 'nl' },
          { name: '🇮🇹 Italian', value: 'it' },
          { name: '🇷🇺 Russian', value: 'ru' },
          { name: '🇯🇵 Japanese', value: 'ja' },
          { name: '🇰🇷 Korean', value: 'ko' },
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'language',
  description: 'Set the bot language for this server',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const lang = interaction.options.getString('language');

    await query(
      'UPDATE guilds SET language = $1 WHERE id = $2',
      [lang, interaction.guild.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Language Updated')
      .setDescription(`Bot language set to **${languages[lang]}** (\`${lang}\`)`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
