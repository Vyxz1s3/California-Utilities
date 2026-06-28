import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromWallet } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const FEED_COST = 50;
const PET_EMOJIS = { dog: '🐕', cat: '🐈', dragon: '🐉', phoenix: '🦅' };

export default {
  data: new SlashCommandBuilder()
    .setName('pet-feed')
    .setDescription(`Feed your pet to reduce hunger (costs $${FEED_COST})`),

  name: 'pet-feed',
  description: 'Feed your pet',

  async execute(interaction, client) {
    const userId = interaction.user.id;

    const res = await query('SELECT * FROM user_pets WHERE user_id = $1', [userId]);
    if (res.rows.length === 0) {
      return interaction.reply({ content: "❌ You don't have a pet! Use `/pet-adopt` to get one.", ephemeral: true });
    }

    const pet = res.rows[0];
    if (pet.hunger === 0) {
      return interaction.reply({ content: '❌ Your pet is not hungry right now!', ephemeral: true });
    }

    const { wallet } = await getBalance(userId);
    if (wallet < FEED_COST) {
      return interaction.reply({ content: `❌ Feeding your pet costs **$${formatNumber(FEED_COST)}** but you only have **$${formatNumber(wallet)}**.`, ephemeral: true });
    }

    await removeFromWallet(userId, FEED_COST);
    const newHunger = Math.max(0, pet.hunger - 30);
    const newHappiness = Math.min(100, pet.happiness + 5);
    await query(
      'UPDATE user_pets SET hunger = $1, happiness = $2 WHERE id = $3',
      [newHunger, newHappiness, pet.id]
    );

    const emoji = PET_EMOJIS[pet.pet_type] || '🐾';
    const displayName = pet.name || `Your ${pet.pet_type}`;

    const embed = new EmbedBuilder()
      .setColor('#e91e63')
      .setTitle(`${emoji} Fed ${displayName}!`)
      .setDescription(`You fed your pet for **$${formatNumber(FEED_COST)}**. They look satisfied!`)
      .addFields(
        { name: '🍖 Hunger', value: `${pet.hunger} → ${newHunger}`, inline: true },
        { name: '😊 Happiness', value: `${pet.happiness} → ${newHappiness}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
