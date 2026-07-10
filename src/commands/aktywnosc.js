const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');
const registry = require('../utils/registry');

const AKTYWNOSC_IMAGE_URL = 'https://cdn.discordapp.com/attachments/1482056272135061556/1524734673341648987/standard_8.gif?ex=6a5224d2&is=6a50d352&hm=07fd3d5ff00234d3049a38641f444e2a94911a0b57d389e5407e588d6a18a014&';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aktywnosc')
    .setDescription('Tworzy ogłoszenie aktywności z rankingiem pierwszych 3 osób, które zareagują')
    .addStringOption((o) => o.setName('emotka').setDescription('Emotka, którą trzeba zareagować (np. 🟢)').setRequired(true))
    .addIntegerOption((o) => o.setName('cel').setDescription('Cel (np. liczba osób)').setRequired(true))
    .addRoleOption((o) => o.setName('rola').setDescription('Rola do wspomnienia (ping)').setRequired(false))
    .addStringOption((o) => o.setName('notatka').setDescription('Dodatkowa notatka').setRequired(false)),
  async execute(interaction) {
    const emotka = interaction.options.getString('emotka');
    const cel = interaction.options.getInteger('cel');
    const rola = interaction.options.getRole('rola');
    const notatka = interaction.options.getString('notatka');

    const fields = [
      { name: '👤 Kto', value: `${interaction.user}`, inline: true },
      { name: '🎯 Cel', value: `${cel}`, inline: true },
      { name: '✅ Emotka', value: emotka, inline: true },
      {
        name: '🏆 Ranking (na żywo)',
        value: 'Bądź pierwszy/a! Miejsca pojawią się tutaj po zareagowaniu.',
        inline: false,
      },
    ];
    if (notatka) {
      fields.push({ name: '📝 Notatka', value: notatka, inline: false });
    }

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('📢 Aktywność')
      .addFields(fields)
      .setImage(AKTYWNOSC_IMAGE_URL)
      .setFooter({ text: config.serverName })
      .setTimestamp();

    await interaction.reply({
      content: rola ? `${rola}` : undefined,
      embeds: [embed],
    });

    const message = await interaction.fetchReply();

    registry.createAktywnoscSession(message.id, {
      channelId: message.channelId,
      emoji: emotka,
      cel,
      rola: rola ? rola.id : null,
      notatka: notatka || null,
      createdBy: interaction.user.id,
    });

    try {
      await message.react(emotka);
    } catch (error) {
      console.error('Nie udało się dodać domyślnej reakcji do wiadomości aktywności:', error);
    }
  },
};
