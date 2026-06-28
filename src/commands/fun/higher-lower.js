import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('higher-lower')
    .setDescription('Play higher or lower — guess if the next number is higher or lower'),

  name: 'higher-lower',
  description: 'Play higher or lower — guess if the next number is higher or lower',

  async execute(interaction, client) {
    let current = Math.floor(Math.random() * 100) + 1;
    let score = 0;

    function buildEmbed(next = null, correct = null) {
      const embed = new EmbedBuilder()
        .setColor(correct === null ? 0x5865F2 : correct ? 0x2ECC71 : 0xE74C3C)
        .setTitle('📊 Higher or Lower')
        .addFields({ name: 'Current Number', value: `**${current}**`, inline: true })
        .setFooter({ text: `Score: ${score}` })
        .setTimestamp();

      if (next !== null) {
        embed.addFields({ name: 'Next Number', value: `**${next}**`, inline: true });
      }

      embed.setDescription(correct === null
        ? 'Will the next number be **higher** or **lower**?'
        : correct ? '✅ Correct! Keep going!' : `❌ Wrong! Game over. Final score: **${score}**`
      );

      return embed;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hl_higher').setLabel('📈 Higher').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('hl_lower').setLabel('📉 Lower').setStyle(ButtonStyle.Danger),
    );

    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('hl_higher').setLabel('📈 Higher').setStyle(ButtonStyle.Success).setDisabled(true),
      new ButtonBuilder().setCustomId('hl_lower').setLabel('📉 Lower').setStyle(ButtonStyle.Danger).setDisabled(true),
    );

    const reply = await interaction.reply({
      embeds: [buildEmbed()],
      components: [row],
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === interaction.user.id && i.customId.startsWith('hl_'),
      time: 60_000,
    });

    collector.on('collect', async i => {
      const next = Math.floor(Math.random() * 100) + 1;
      const guessHigher = i.customId === 'hl_higher';
      const correct = guessHigher ? next > current : next < current;

      if (correct) {
        score++;
        current = next;
        await i.update({ embeds: [buildEmbed(next, true)], components: [row] });
      } else {
        await i.update({ embeds: [buildEmbed(next, false)], components: [disabledRow] });
        collector.stop();
      }
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        await reply.edit({ components: [disabledRow] }).catch(() => {});
      }
    });
  },
};
