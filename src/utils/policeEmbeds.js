const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { getRankLabel } = require('../data/policeRanks');
const { MAX_POINTS_BEFORE_SUSPENSION } = require('./registry');

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}min`;
}

function buildSprawdzGraczaEmbed({ nick, discordId, record, activePoints }) {
  const embed = new EmbedBuilder()
    .setColor(record && record.wanted ? '#e02b2b' : config.embedColor)
    .setTitle(`🔎 Profil gracza — ${nick}`)
    .setFooter({ text: config.serverName })
    .setTimestamp();

  if (!record) {
    embed.setDescription('Brak jakichkolwiek danych w rejestrze dla tego nicku Roblox.');
    return embed;
  }

  if (discordId) {
    embed.addFields({ name: '👤 Konto Discord', value: `<@${discordId}> (${record.discordTag || 'nieznany tag'})`, inline: false });
  }

  if (record.idCard) {
    embed.addFields({
      name: '🪪 Dowód Osobisty RP',
      value:
        `**Dane:** ${record.idCard.fullName}\n` +
        `**Wiek:** ${record.idCard.age}\n` +
        `**Obywatelstwo:** ${record.idCard.citizenship}\n` +
        `**Numer:** ${record.idCard.idNumber}`,
      inline: false,
    });
  } else {
    embed.addFields({ name: '🪪 Dowód Osobisty RP', value: 'Brak zarejestrowanego dowodu.', inline: false });
  }

  if (record.license.categories.length > 0) {
    const categoriesText = record.license.categories
      .map((c) => `• Kat. **${c.category}** — \`${c.licenseNumber}\``)
      .join('\n');
    const suspendedText = record.license.suspended
      ? `\n\n🚫 **ZAWIESZONE** — powód: ${record.license.suspendedReason || 'brak podanego powodu'}`
      : '';
    embed.addFields({ name: '🚗 Prawo jazdy', value: categoriesText + suspendedText, inline: false });
  } else {
    embed.addFields({ name: '🚗 Prawo jazdy', value: 'Brak zarejestrowanego prawa jazdy.', inline: false });
  }

  if (record.vehicles.length > 0) {
    const vehiclesText = record.vehicles
      .map((v) => `• ${v.make} (${v.year}), ${v.color} — \`${v.plateNumber}\``)
      .join('\n');
    embed.addFields({ name: `🚙 Pojazdy (${record.vehicles.length})`, value: vehiclesText, inline: false });
  } else {
    embed.addFields({ name: '🚙 Pojazdy', value: 'Brak zarejestrowanych pojazdów.', inline: false });
  }

  if (record.organizations && record.organizations.length > 0) {
    const orgsText = record.organizations.map((o) => `• **${o.name}** — \`${o.orgNumber}\``).join('\n');
    embed.addFields({ name: `🔫 Organizacje (${record.organizations.length})`, value: orgsText, inline: false });
  }

  if (record.citations.length > 0) {
    const total = record.citations.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const lastCitations = record.citations
      .slice(-3)
      .reverse()
      .map((c) => `• ${c.amount} zł, ${c.points || 0} pkt — ${c.reason} (<@${c.issuedBy}>)`)
      .join('\n');
    embed.addFields({
      name: `📋 Rejestr karny — ${record.citations.length} mandat(y), łącznie ${total} zł`,
      value: lastCitations,
      inline: false,
    });
  } else {
    embed.addFields({ name: '📋 Rejestr karny', value: 'Czysty — brak mandatów.', inline: false });
  }

  const points = activePoints || 0;
  embed.addFields({
    name: '🔢 Punkty karne (aktywne)',
    value:
      `**${points} / ${MAX_POINTS_BEFORE_SUSPENSION}**` +
      (points >= MAX_POINTS_BEFORE_SUSPENSION ? ' — 🚫 przekroczono limit!' : '') +
      '\n*Punkty wygasają rok po wystawieniu mandatu.*',
    inline: false,
  });

  embed.addFields({
    name: '🚨 Status poszukiwań',
    value: record.wanted
      ? `**POSZUKIWANY** — powód: ${record.wanted.reason} (zgłosił <@${record.wanted.issuedBy}>)`
      : '✅ Nie jest poszukiwany.',
    inline: false,
  });

  if (record.police && record.police.rank) {
    const rankLine = `${getRankLabel(record.police.rank)}${record.police.cbsp ? ' — CBŚP' : ''}`;
    embed.addFields({ name: '👮 Funkcjonariusz', value: rankLine, inline: false });
  }

  return embed;
}

function buildMandatEmbed({ officer, target, amount, points, reason, activePoints, autoSuspended }) {
  const embed = new EmbedBuilder()
    .setColor('#e02b2b')
    .setTitle('📋 Wystawiono mandat')
    .addFields(
      { name: '👤 Ukarany', value: `${target}`, inline: true },
      { name: '👮 Funkcjonariusz', value: `${officer}`, inline: true },
      { name: '💵 Kwota', value: `${amount} zł`, inline: true },
      { name: '🔢 Punkty karne', value: `${points} (aktywne: ${activePoints}/${MAX_POINTS_BEFORE_SUSPENSION})`, inline: true },
      { name: '📝 Powód', value: reason, inline: false }
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();

  if (autoSuspended) {
    embed.addFields({
      name: '🚫 Automatyczne zawieszenie prawa jazdy',
      value: `Przekroczono ${MAX_POINTS_BEFORE_SUSPENSION} aktywnych punktów karnych — prawo jazdy zostało zawieszone.`,
      inline: false,
    });
  }

  return embed;
}

function buildGonionyEmbed({ officer, target, action, reason }) {
  const added = action === 'dodaj';
  return new EmbedBuilder()
    .setColor(added ? '#e02b2b' : config.embedColor)
    .setTitle(added ? '🚨 Ogłoszono list gończy' : '✅ Zdjęto z listy gończej')
    .addFields(
      { name: '👤 Gracz', value: `${target}`, inline: true },
      { name: '👮 Funkcjonariusz', value: `${officer}`, inline: true },
      ...(added ? [{ name: '📝 Powód', value: reason, inline: false }] : [])
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();
}

function buildZawieszenieEmbed({ officer, target, action, reason }) {
  const suspended = action === 'zawiesz';
  return new EmbedBuilder()
    .setColor(suspended ? '#e02b2b' : config.embedColor)
    .setTitle(suspended ? '🚫 Zawieszono prawo jazdy' : '✅ Przywrócono prawo jazdy')
    .addFields(
      { name: '👤 Gracz', value: `${target}`, inline: true },
      { name: '👮 Funkcjonariusz', value: `${officer}`, inline: true },
      ...(suspended ? [{ name: '📝 Powód', value: reason, inline: false }] : [])
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();
}

function buildSluzbaEmbed({ officer, started, durationMs }) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle(started ? '🟢 Rozpoczęto służbę' : '🔴 Zakończono służbę')
    .addFields(
      { name: '👮 Funkcjonariusz', value: `${officer}`, inline: true },
      ...(started ? [] : [{ name: '⏱️ Czas służby', value: formatDuration(durationMs), inline: true }])
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();
}

function buildRankingEmbed(ranking) {
  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🏆 Ranking aktywności służby')
    .setFooter({ text: config.serverName })
    .setTimestamp();

  if (ranking.length === 0) {
    embed.setDescription('Nikt jeszcze nie pełnił służby.');
    return embed;
  }

  const lines = ranking.map((entry, index) => {
    const status = entry.onDuty ? ' 🟢 *(na służbie)*' : '';
    return `**${index + 1}.** <@${entry.discordId}> — ${formatDuration(entry.totalDutyMs)}${status}`;
  });

  embed.setDescription(lines.join('\n'));
  return embed;
}

function buildAwansEmbed({ officer, target, action, newRankLabel }) {
  const promoted = action === 'awans';
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle(promoted ? '⬆️ Awans' : '⬇️ Degradacja')
    .addFields(
      { name: '👤 Funkcjonariusz', value: `${target}`, inline: true },
      { name: '🆕 Nowa ranga', value: newRankLabel, inline: true },
      { name: '✍️ Zatwierdził', value: `${officer}`, inline: true }
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();
}

function buildCbspEmbed({ officer, target, action }) {
  const added = action === 'dodaj';
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle(added ? '🕵️ Przydzielono do CBŚP' : '🕵️ Usunięto z CBŚP')
    .addFields(
      { name: '👤 Funkcjonariusz', value: `${target}`, inline: true },
      { name: '✍️ Zatwierdził', value: `${officer}`, inline: true }
    )
    .setFooter({ text: config.serverName })
    .setTimestamp();
}

module.exports = {
  buildSprawdzGraczaEmbed,
  buildMandatEmbed,
  buildGonionyEmbed,
  buildZawieszenieEmbed,
  buildSluzbaEmbed,
  buildRankingEmbed,
  buildAwansEmbed,
  buildCbspEmbed,
};
