import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { checkEconomyCooldown, setEconomyCooldown } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const COOLDOWN_SECONDS = 3600; // 1 hour
const PET_EMOJIS = { dog: '🐕', cat: '🐈', dragon: '🐉', phoenix: '🦅' };

const PLAY_MESSAGES = [
  'You threw a ball and they chased it excitedly!',
  'You played tug-of-war and they loved every second!',
  'You scratched behind their ears and they purred with delight!',
  'You ran around the yard together!',
  'You taught them a new trick!',
];

export default {
  data: new SlashCommandBuilder()
    .setName('pet-play')
    .setDescription('Play with your pet to boost their happiness (1-hour cooldown)'),

  name: 'pet-play',
  description: 'Play with your pet',

  async execute(interaction, client) {
    const userId = interaction.user.id;

    const res = await query('SELECT * FROM user_pets WHERE user_id = $1', [userId]);
    if (res.rows.length === 0) {
      return interaction.reply({ content: "❌ You don't have a pet! Use `/pet-adopt` to get one.", ephemeral: true });
    }

    const cd = await checkEconomyCooldown(userId, 'pet-play');
    if (cd.onCooldown) {
      return interaction.reply({ content: `⏰ Your pet needs to rest! Try again in **${cd.timeLeft}**.`, ephemeral: true });
    }

    const pet = res.rows[0];
    const newHappiness = Math.min(100, pet.happiness + 15);
    const newHunger = Math.min(100, pet.hunger + 10);
    await query(
      'UPDATE user_pets SET happiness = $1, hunger = $2 WHERE id = $3',
      [newHappiness, newHunger, pet.id]
    );
    await setEconomyCooldown(userId, 'pet-play', COOLDOWN_SECONDS);

    const emoji = PET_EMOJIS[pet.pet_type] || '🐾';
    const displayName = pet.name || `Your ${pet.pet_type}`;
    const playMsg = PLAY_MESSAGES[Math.floor(Math.random() * PLAY_MESSAGES.length)];

    const embed = new EmbedBuilder()
      .setColor('#e91e63')
      .setTitle(`${emoji} Playtime with ${displayName}!`)
      .setDescription(playMsg)
      .addFields(
        { name: '😊 Happiness', value: `${pet.happiness} → ${newHappiness}`, inline: true },
        { name: '🍖 Hunger', value: `${pet.hunger} → ${newHunger}`, inline: true }
      )
      .setFooter({ text: 'Cooldown: 1 hour' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
