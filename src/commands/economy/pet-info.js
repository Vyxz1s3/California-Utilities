import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

const PET_EMOJIS = { dog: '🐕', cat: '🐈', dragon: '🐉', phoenix: '🦅' };

function happinessBar(value) {
  const filled = Math.round(value / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled) + ` ${value}/100`;
}

export default {
  data: new SlashCommandBuilder()
    .setName('pet-info')
    .setDescription("View your pet's info and status")
    .addUserOption(option =>
      option.setName('user')
        .setDescription("User whose pet to view (defaults to you)")
        .setRequired(false)
    ),

  name: 'pet-info',
  description: "View pet info",

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;

    const res = await query('SELECT * FROM user_pets WHERE user_id = $1', [target.id]);
    if (res.rows.length === 0) {
      const msg = target.id === interaction.user.id
        ? "❌ You don't have a pet yet! Use `/pet-adopt` to get one."
        : `❌ **${target.username}** doesn't have a pet.`;
      return interaction.reply({ content: msg, ephemeral: true });
    }

    const pet = res.rows[0];
    const emoji = PET_EMOJIS[pet.pet_type] || '🐾';
    const displayName = pet.name || `${target.username}'s ${pet.pet_type}`;

    const embed = new EmbedBuilder()
      .setColor('#e91e63')
      .setTitle(`${emoji} ${displayName}`)
      .addFields(
        { name: '👤 Owner', value: target.username, inline: true },
        { name: '🐾 Type', value: pet.pet_type.charAt(0).toUpperCase() + pet.pet_type.slice(1), inline: true },
        { name: '😊 Happiness', value: happinessBar(pet.happiness), inline: false },
        { name: '🍖 Hunger', value: happinessBar(pet.hunger), inline: false },
        { name: '📅 Adopted', value: new Date(pet.adopted_at).toLocaleDateString(), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
