const { EmbedBuilder } = require('discord.js');
const config = require('../config');

function buildPanelEmbed(awardRole) {
  const roleLine = awardRole ? `\n\nPo wysłaniu dowodu automatycznie otrzymasz rolę ${awardRole}.` : '';

  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('📋 Panel — Dowód Osobisty RP')
    .setDescription(
      'Kliknij przycisk poniżej, aby wypełnić formularz i wygenerować swój **Dowód Osobisty RP**.\n\n' +
        'Będziesz musiał podać:\n' +
        '• Imię i nazwisko RP\n' +
        '• Wiek RP\n' +
        '• Obywatelstwo RP\n' +
        `• Nick Roblox (zostanie automatycznie zweryfikowany)${roleLine}`
    )
    .setFooter({ text: config.serverName });
}

function buildIdCardEmbed({
  discordUser,
  fullName,
  age,
  citizenship,
  robloxUsername,
  robloxData,
  idNumber,
  awardRoleId,
}) {
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

  if (awardRoleId) {
    embed.addFields({ name: '🔑 Rola po wysłaniu', value: `<@&${awardRoleId}>`, inline: false });
  }

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

function buildExamPanelEmbed(targetChannel, awardRole, requiredRole) {
  const roleLine = awardRole ? `\n\nPo zdanym egzaminie automatycznie otrzymasz rolę ${awardRole}.` : '';
  const requiredLine = requiredRole ? `\n\nWymagana jest rola ${requiredRole}, aby móc przystąpić.` : '';

  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🚗 Panel — Egzamin na Prawo Jazdy RP')
    .setDescription(
      'Kliknij przycisk poniżej, aby podejść do egzaminu na **Prawo Jazdy RP**.\n\n' +
        'Najpierw wybierzesz kategorię i wypełnisz krótki formularz zgłoszeniowy (imię i nazwisko RP, ' +
        'wiek RP, nick Roblox), a następnie odpowiesz na losowe pytania egzaminu teoretycznego — ' +
        'dokładnie jak na prawdziwym egzaminie. Minimalny wiek zależy od wybranej kategorii.\n\n' +
        `Po zdanym egzaminie Twoje Prawo Jazdy RP trafi na kanał ${targetChannel}.${roleLine}${requiredLine}`
    )
    .setFooter({ text: config.serverName });
}

function buildExamCandidateEmbed({ discordUser, fullName, age, category, robloxData, awardRoleId }) {
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

  if (awardRoleId) {
    embed.addFields({ name: '🔑 Rola po zdaniu', value: `<@&${awardRoleId}>`, inline: true });
  }

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

function getEmbedFieldValue(embed, nameIncludes) {
  const field = embed.fields?.find((f) => f.name.includes(nameIncludes));
  return field ? field.value : 'brak danych';
}

function buildVehiclePanelEmbed(targetChannel, requiredRole) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🚙 Panel — Rejestracja Pojazdu RP')
    .setDescription(
      'Kliknij przycisk poniżej, aby zarejestrować swój pojazd.\n\n' +
        `Wymagana jest rola ${requiredRole} (prawo jazdy) — bez niej przycisk nie zadziała.\n\n` +
        `Po rejestracji dowód rejestracyjny pojazdu trafi na kanał ${targetChannel}.`
    )
    .setFooter({ text: config.serverName });
}

function buildVehicleCardEmbed({ discordUser, make, year, color, engine, owner, category, plateNumber, vin }) {
  const now = Math.floor(Date.now() / 1000);
  const oneYear = 365 * 24 * 60 * 60;

  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🚗 Dowód Rejestracyjny Pojazdu RP')
    .setAuthor({ name: discordUser.tag, iconURL: discordUser.displayAvatarURL() })
    .addFields(
      { name: '👤 Właściciel', value: owner, inline: false },
      { name: '🚙 Marka i model', value: make, inline: true },
      { name: '📅 Rok produkcji', value: String(year), inline: true },
      { name: '🎨 Kolor', value: color, inline: true },
      { name: '🔧 Silnik', value: engine, inline: true },
      { name: '🚦 Kategoria', value: category, inline: true },
      { name: '🔢 Numer rejestracyjny', value: `\`${plateNumber}\``, inline: true },
      { name: '🆔 VIN', value: `\`${vin}\``, inline: false },
      { name: '📆 Data rejestracji', value: `<t:${now}:D>`, inline: true },
      { name: '🛠️ Ważny przegląd do', value: `<t:${now + oneYear}:D>`, inline: true },
      { name: '📄 Ważne OC do', value: `<t:${now + oneYear}:D>`, inline: true },
      { name: '✅ Status', value: 'Aktywna', inline: true }
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();
}

function buildTicketPanelEmbed(supportRole) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🎫 Panel — Wsparcie / Tickety')
    .setDescription(
      'Kliknij przycisk poniżej, aby stworzyć prywatny kanał z obsługą serwera.\n\n' +
        `Twój ticket zobaczy tylko rola ${supportRole} — a gdy ktoś z obsługi go przyjmie, kanał będzie ` +
        'widoczny już tylko dla Ciebie i tej jednej osoby.'
    )
    .setFooter({ text: config.serverName });
}

function buildTicketEmbed({ owner, reason, claimerId }) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🎫 Ticket')
    .addFields(
      { name: '👤 Utworzone przez', value: `${owner}`, inline: true },
      {
        name: '📌 Status',
        value: claimerId ? `🟢 Przyjęty przez <@${claimerId}>` : '🟡 Oczekuje na przyjęcie',
        inline: true,
      },
      { name: '📝 Temat', value: reason, inline: false }
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();
}

function buildApplicationPanelEmbed(supportRole, { title, extraLine } = {}) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle(title || '📝 Panel — Rekrutacja')
    .setDescription(
      'Kliknij przycisk poniżej, aby złożyć podanie do naszej społeczności.\n\n' +
        `Twoje podanie zobaczy tylko rola ${supportRole} — odpowiedz szczerze, to nie zajmie długo!` +
        (extraLine ? `\n\n${extraLine}` : '')
    )
    .setFooter({ text: config.serverName });
}

function buildApplicationStatusText({ status, reviewerId, rejectReason }) {
  switch (status) {
    case 'review':
      return `👀 W trakcie rozpatrywania przez <@${reviewerId}>`;
    case 'accepted':
      return `✅ Przyjęte przez <@${reviewerId}>`;
    case 'rejected':
      return `❌ Odrzucone przez <@${reviewerId}>${rejectReason ? ` — powód: ${rejectReason}` : ''}`;
    default:
      return '🟡 Nowe podanie';
  }
}

function buildApplicationEmbed({
  applicant,
  mic,
  age,
  otherServers,
  ehExperience,
  foundVia,
  hoursOnServer,
  status,
  reviewerId,
  rejectReason,
}) {
  const createdAt = Math.floor(applicant.user.createdTimestamp / 1000);
  const joinedAt = applicant.joinedTimestamp ? Math.floor(applicant.joinedTimestamp / 1000) : null;

  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('📝 Podanie')
    .setAuthor({ name: applicant.user.tag, iconURL: applicant.user.displayAvatarURL() })
    .addFields(
      { name: '👤 Kandydat', value: `${applicant}`, inline: true },
      { name: '🎙️ Mikrofon', value: mic, inline: true },
      { name: '📅 Konto założone', value: `<t:${createdAt}:R>`, inline: true },
      { name: '🚪 Dołączył na serwer', value: joinedAt ? `<t:${joinedAt}:R>` : 'brak danych', inline: true },
      { name: '🔞 Wiek', value: age, inline: true },
      { name: '⏱️ Staż w Emergency Hamburg', value: ehExperience, inline: true },
      { name: '🌍 Doświadczenie na innych serwerach', value: otherServers, inline: false },
      { name: '📢 Skąd poznał(a) serwer', value: foundVia, inline: false },
      { name: '⏳ Godziny na naszym serwerze', value: hoursOnServer, inline: false },
      { name: '📌 Status', value: buildApplicationStatusText({ status, reviewerId, rejectReason }), inline: false }
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();
}

function buildMafiaPanelEmbed(targetChannel) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🔫 Panel — Stwórz Mafię/Gang')
    .setDescription(
      'Kliknij przycisk poniżej, aby zarejestrować swoją organizację.\n\n' +
        'Podasz właściciela i współwłaściciela, nazwę, ilość osób (min. 3) i kolor aut, a na koniec ' +
        'wyślesz mi na PW zdjęcie mapy bazy.\n\n' +
        `Po utworzeniu karta organizacji trafi na kanał ${targetChannel}.`
    )
    .setFooter({ text: config.serverName });
}

function buildMafiaCardEmbed({ discordUser, owner, coOwner, name, color, size, baseImageUrl, orgNumber }) {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🔫 Rejestracja Mafii/Gangu')
    .setAuthor({ name: discordUser.tag, iconURL: discordUser.displayAvatarURL() })
    .addFields(
      { name: '🏷️ Nazwa', value: name, inline: false },
      { name: '👑 Właściciel', value: owner, inline: true },
      { name: '🤝 Współwłaściciel', value: coOwner, inline: true },
      { name: '🎨 Kolor Aut', value: color, inline: true },
      { name: '👥 Liczba członków', value: size, inline: true },
      { name: '🆔 Numer organizacji', value: orgNumber, inline: true }
    )
    .setImage(baseImageUrl)
    .setFooter({ text: config.serverName })
    .setTimestamp();

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
  getEmbedFieldValue,
  buildVehiclePanelEmbed,
  buildVehicleCardEmbed,
  buildTicketPanelEmbed,
  buildTicketEmbed,
  buildApplicationPanelEmbed,
  buildApplicationEmbed,
  buildMafiaPanelEmbed,
  buildMafiaCardEmbed,
};
