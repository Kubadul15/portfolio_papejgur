const { EmbedBuilder } = require('discord.js');
const config = require('../config');

function buildPanelEmbed() {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('📋 Panel — Dowód Osobisty RP')
    .setDescription(
      'Kliknij przycisk poniżej, aby wypełnić formularz i wygenerować swój **Dowód Osobisty RP**.\n\n' +
        'Będziesz musiał podać:\n' +
        '• Imię i nazwisko RP\n' +
        '• Wiek RP\n' +
        '• Obywatelstwo RP\n' +
        '• Nick Roblox (zostanie automatycznie zweryfikowany)'
    )
    .setFooter({ text: config.serverName });
}

function buildIdCardEmbed({ discordUser, fullName, age, citizenship, robloxUsername, robloxData, idNumber }) {
  const verified = Boolean(robloxData);

  const embed = new EmbedBuilder()
    .setColor(verified ? config.embedColor : '#e02b2b')
    .setTitle('Dowód Osobisty RP')
    .setAuthor({ name: discordUser.tag, iconURL: discordUser.displayAvatarURL() })
    .addFields(
      { name: '👤 Dane', value: fullName, inline: false },
      { name: '📅 Wiek', value: String(age), inline: true },
      { name: '🌍 Obywatelstwo', value: citizenship, inline: true },
      {
        name: '🎲 Nick Roblox',
        value: verified
          ? `[@${robloxData.name}](https://www.roblox.com/users/${robloxData.id}/profile)`
          : `${robloxUsername} ⚠️ *(nie znaleziono takiego konta)*`,
        inline: false,
      },
      { name: '🆔 Numer', value: idNumber, inline: false }
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();

  if (verified && robloxData.avatarUrl) {
    embed.setThumbnail(robloxData.avatarUrl);
  }

  return embed;
}

module.exports = { buildPanelEmbed, buildIdCardEmbed };
