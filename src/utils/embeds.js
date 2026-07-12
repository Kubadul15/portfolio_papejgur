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
    .setTitle('🔐 Panel — Weryfikacja')
    .setDescription(
      'Kliknij przycisk poniżej, aby się zweryfikować.\n\n' +
        'Będziesz musiał podać:\n' +
        '• Imię i nazwisko RP\n' +
        '• Wiek RP\n' +
        '• Obywatelstwo RP\n' +
        '• Nick Roblox (zostanie automatycznie zweryfikowany)\n\n' +
        `Po weryfikacji otrzymasz swój Dowód Osobisty RP oraz rolę ${role}.`
    )
    .setFooter({ text: config.serverName });
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
        'Podasz właściciela i współwłaściciela, nazwę, ilość osób (min. 3), kolor aut i miejscówkę ' +
        '(gdzie jest baza).\n\n' +
        `Po utworzeniu karta organizacji trafi na kanał ${targetChannel}.`
    )
    .setFooter({ text: config.serverName });
}

function buildMafiaCardEmbed({ discordUser, owner, coOwner, name, color, size, location, orgNumber }) {
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
      { name: '🆔 Numer organizacji', value: orgNumber, inline: true },
      { name: '📍 Miejscówka', value: location, inline: false }
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();

  return embed;
}

function buildHousePanelEmbed(targetChannel) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🏠 Panel — Załóż Dom RP')
    .setDescription(
      'Kliknij przycisk poniżej, aby zarejestrować swój dom lub mieszkanie.\n\n' +
        'Najpierw wybierzesz typ nieruchomości, potem podasz właściciela, lokalizację, adres, cenę i ' +
        'liczbę pokoi, a na końcu dodatkowe szczegóły (powierzchnię, rok budowy, garaż, basen, opis).\n\n' +
        `Po rejestracji Akt Własności Domu RP trafi na kanał ${targetChannel}.`
    )
    .setFooter({ text: config.serverName });
}

function buildHouseCardEmbed({
  discordUser,
  category,
  owner,
  location,
  address,
  price,
  rooms,
  area,
  yearBuilt,
  garage,
  pool,
  description,
  houseNumber,
}) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🏠 Akt Własności Domu RP')
    .setAuthor({ name: discordUser.tag, iconURL: discordUser.displayAvatarURL() })
    .addFields(
      { name: '🏠 Typ nieruchomości', value: category, inline: true },
      { name: '👤 Właściciel', value: owner, inline: true },
      { name: '📍 Lokalizacja', value: location, inline: true },
      { name: '🏘️ Adres', value: address, inline: false },
      { name: '💰 Cena', value: `${Number(price).toLocaleString('pl-PL')} zł`, inline: true },
      { name: '🚪 Liczba pokoi', value: String(rooms), inline: true },
      { name: '📐 Powierzchnia', value: `${area} m²`, inline: true },
      { name: '🏗️ Rok budowy', value: String(yearBuilt), inline: true },
      { name: '🚗 Garaż', value: garage ? 'Tak' : 'Nie', inline: true },
      { name: '🏊 Basen', value: pool ? 'Tak' : 'Nie', inline: true },
      { name: '📝 Opis', value: description, inline: false },
      { name: '🆔 Numer aktu', value: houseNumber, inline: false }
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();
}

function formatMoney(amount) {
  return `${Number(amount).toLocaleString('pl-PL')} zł`;
}

function buildAuctionPanelEmbed(targetChannel, adminRoleMention) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🏛️ Panel — Aukcje Domów RP')
    .setDescription(
      `Tylko rola ${adminRoleMention} może rozpocząć aukcję domu przyciskiem poniżej — poda nazwę domu, ` +
        'lokalizację, cenę wywoławczą, minimalną podbitkę i opis.\n\n' +
        `Gdy aukcja ruszy na kanale ${targetChannel}, każdy może licytować przyciskiem **Licytuj** — ` +
        'najwyższa oferta wygrywa po zamknięciu aukcji przez prowadzącego (przycisk **Zakończ aukcję**).'
    )
    .setFooter({ text: config.serverName });
}

function buildAuctionEmbed(auction, auctionId) {
  const bidLine =
    auction.highestBid !== null
      ? `${formatMoney(auction.highestBid)} — <@${auction.highestBidderId}>`
      : `Brak ofert — cena wywoławcza ${formatMoney(auction.startingPrice)}`;

  const statusLine =
    auction.status === 'active'
      ? '🟢 Aktywna'
      : auction.highestBid !== null
        ? `🔴 Zakończona — wygrywa <@${auction.highestBidderId}> za ${formatMoney(auction.highestBid)}`
        : '🔴 Zakończona — brak ofert';

  return new EmbedBuilder()
    .setColor(auction.status === 'active' ? config.embedColor : '#e02b2b')
    .setTitle(`🏛️ Aukcja Domu RP — ${auction.house}`)
    .addFields(
      { name: '📍 Lokalizacja', value: auction.location, inline: true },
      { name: '🧑‍⚖️ Aukcjoner', value: `<@${auction.auctioneerId}>`, inline: true },
      { name: '📌 Status', value: statusLine, inline: false },
      { name: '📝 Opis', value: auction.description, inline: false },
      { name: '💰 Cena wywoławcza', value: formatMoney(auction.startingPrice), inline: true },
      { name: '📈 Minimalna podbitka', value: formatMoney(auction.minIncrement), inline: true },
      { name: '🏆 Aktualna oferta', value: bidLine, inline: false },
      { name: '🆔 Numer aukcji', value: `AUK-${auctionId.toUpperCase()}`, inline: false }
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();
}

module.exports = {
  buildPanelEmbed,
  buildIdCardEmbed,
  buildVerificationPanelEmbed,
  getEmbedFieldValue,
  buildVehiclePanelEmbed,
  buildVehicleCardEmbed,
  buildTicketPanelEmbed,
  buildTicketEmbed,
  buildApplicationPanelEmbed,
  buildApplicationEmbed,
  buildMafiaPanelEmbed,
  buildMafiaCardEmbed,
  buildHousePanelEmbed,
  buildHouseCardEmbed,
  buildAuctionPanelEmbed,
  buildAuctionEmbed,
};
