import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { formatNumber } from '../../utils/helpers.js';
import { getBalance, removeFromWallet, unlockAchievement } from '../../utils/economy.js';
import { query } from '../../database/db.js';

const PET_TYPES = {
  dog:     { emoji: '🐕', cost: 500,  description: 'Friendly and loyal.' },
  cat:     { emoji: '🐈', cost: 500,  description: 'Independent and mysterious.' },
  dragon:  { emoji: '🐉', cost: 2000, description: 'Rare and powerful.' },
  phoenix: { emoji: '🦅', cost: 5000, description: 'Legendary and immortal.' },
};

export default {
  data: new SlashCommandBuilder()
    .setName('pet-adopt')
    .setDescription('Adopt a pet companion')
    .addStringOption(option =>
      option.setName('pet_type')
        .setDescription('Type of pet to adopt')
        .setRequired(true)
        .addChoices(
          { name: '🐕 Dog (500 coins)', value: 'dog' },
          { name: '🐈 Cat (500 coins)', value: 'cat' },
          { name: '🐉 Dragon (2000 coins)', value: 'dragon' },
          { name: '🦅 Phoenix (5000 coins)', value: 'phoenix' }
        )
    )
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name your pet (optional)')
        .setRequired(false)
        .setMaxLength(30)
    ),

  name: 'pet-adopt',
  description: 'Adopt a pet',

  async execute(interaction, client) {
    const userId = interaction.user.id;
    const petType = interaction.options.getString('pet_type');
    const petName = interaction.options.getString('name') || null;
    const pet = PET_TYPES[petType];

    // Check existing pet
    const existing = await query('SELECT id FROM user_pets WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      return interaction.reply({ content: '❌ You already have a pet! Use `/pet-info` to check on them.', ephemeral: true });
    }

    const { wallet } = await getBalance(userId);
    if (wallet < pet.cost) {
      return interaction.reply({ content: `❌ Adopting a ${petType} costs **$${formatNumber(pet.cost)}** but you only have **$${formatNumber(wallet)}**.`, ephemeral: true });
    }

    await removeFromWallet(userId, pet.cost);
    await query(
      'INSERT INTO user_pets (user_id, pet_type, name) VALUES ($1, $2, $3)',
      [userId, petType, petName]
    );
    await unlockAchievement(userId, 'pet_lover');

    const displayName = petName || `Your ${petType}`;

    const embed = new EmbedBuilder()
      .setColor('#e91e63')
      .setTitle(`${pet.emoji} Pet Adopted!`)
      .setDescription(`Welcome **${displayName}** to the family! ${pet.description}`)
      .addFields(
        { name: '🐾 Type', value: petType.charAt(0).toUpperCase() + petType.slice(1), inline: true },
        { name: '😊 Happiness', value: '100/100', inline: true },
        { name: '🍖 Hunger', value: '0/100', inline: true },
        { name: '💡 Tip', value: 'Use `/pet-feed` and `/pet-play` to keep your pet happy!', inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
