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

function buildVerificationPanelEmbed(role) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🔐 Panel — Weryfikacja Roblox')
    .setDescription(
      'Kliknij przycisk poniżej, aby zweryfikować swoje konto Roblox.\n\n' +
        `Po pozytywnej weryfikacji otrzymasz rolę ${role}.`
    )
    .setFooter({ text: config.serverName });
}

function buildVerificationCodeEmbed({ discordUser, robloxData, code }) {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('Weryfikacja konta Roblox')
    .setAuthor({ name: discordUser.tag, iconURL: discordUser.displayAvatarURL() })
    .addFields(
      {
        name: '🎲 Konto Roblox',
        value: `[@${robloxData.name}](https://www.roblox.com/users/${robloxData.id}/profile)`,
        inline: false,
      },
      { name: '🔑 Twój kod', value: `\`${code}\``, inline: false },
      {
        name: '📋 Co zrobić',
        value:
          '1. Wejdź w edycję profilu na Roblox i wklej powyższy kod do pola **Opis (About)**.\n' +
          '2. Zapisz zmiany na Roblox.\n' +
          '3. Wróć tutaj i kliknij **Sprawdź kod**.',
        inline: false,
      }
    )
    .setFooter({ text: 'Kod możesz usunąć z opisu po zakończonej weryfikacji.' });

  if (robloxData.avatarUrl) {
    embed.setThumbnail(robloxData.avatarUrl);
  }

  return embed;
}

function buildExamPanelEmbed(targetChannel) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🚗 Panel — Egzamin na Prawo Jazdy RP')
    .setDescription(
      'Kliknij przycisk poniżej, aby podejść do egzaminu na **Prawo Jazdy RP**.\n\n' +
        'Najpierw wypełnisz krótki formularz zgłoszeniowy (imię i nazwisko RP, wiek RP, nick Roblox), ' +
        'a następnie odpowiesz na pytania egzaminu teoretycznego — dokładnie jak na prawdziwym egzaminie.\n\n' +
        `Po zdanym egzaminie Twoje Prawo Jazdy RP trafi na kanał ${targetChannel}.`
    )
    .setFooter({ text: config.serverName });
}

function buildExamCandidateEmbed({ discordUser, fullName, age, category, robloxData }) {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🚗 Egzamin na Prawo Jazdy RP')
    .setAuthor({ name: discordUser.tag, iconURL: discordUser.displayAvatarURL() })
    .addFields(
      { name: '👤 Dane', value: fullName, inline: false },
      { name: '📅 Wiek', value: String(age), inline: true },
      { name: '🚙 Kategoria', value: category, inline: true },
      {
        name: '🎲 Nick Roblox',
        value: `[@${robloxData.name}](https://www.roblox.com/users/${robloxData.id}/profile)`,
        inline: false,
      }
    )
    .setFooter({ text: config.serverName });

  if (robloxData.avatarUrl) {
    embed.setThumbnail(robloxData.avatarUrl);
  }

  return embed;
}

function buildExamQuestionEmbed(question, index, total, score) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle(`Pytanie ${index + 1} / ${total}`)
    .setDescription(question.question)
    .setFooter({ text: `Aktualny wynik: ${score}/${index}` });
}

function buildExamResultEmbed({ candidateEmbed, score, total, passed, licenseNumber }) {
  const embed = EmbedBuilder.from(candidateEmbed);

  if (passed) {
    embed
      .setColor(config.embedColor)
      .setTitle('🚗 Prawo Jazdy RP')
      .addFields(
        { name: '✅ Wynik egzaminu', value: `${score}/${total}`, inline: true },
        { name: '🆔 Numer', value: licenseNumber, inline: true }
      )
      .setTimestamp();
  } else {
    embed
      .setColor('#e02b2b')
      .setTitle('❌ Egzamin niezdany')
      .addFields({
        name: 'Wynik',
        value: `${score}/${total} — spróbuj ponownie, korzystając z przycisku w panelu.`,
        inline: false,
      });
  }

  return embed;
}

module.exports = {
  buildPanelEmbed,
  buildIdCardEmbed,
  buildVerificationPanelEmbed,
  buildVerificationCodeEmbed,
  buildExamPanelEmbed,
  buildExamCandidateEmbed,
  buildExamQuestionEmbed,
  buildExamResultEmbed,
};
