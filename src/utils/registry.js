const fs = require('fs');
const path = require('path');
const config = require('../config');

// Jedyny w calym bocie modul trzymajacy stan poza Discordem - trwaly rejestr
// dowodow/praw jazdy/pojazdow/systemu policyjnego, zapisywany do pliku JSON
// (sciezka: config.registryPath). Na Railway wymaga podpietego Volume, w
// przeciwnym razie dane znikaja przy kazdym redeployu (patrz README).
//
// Prosty wzorzec read-modify-write: kazda mutacja wczytuje caly plik,
// modyfikuje obiekt w pamieci i zapisuje z powrotem (najpierw do pliku
// tymczasowego, potem atomowy rename) - ruch jest na tyle maly (komendy
// Discorda), ze nie potrzeba nic bardziej wyrafinowanego niz fs *Sync.

function defaultRegistry() {
  return {
    config: {
      policeRoleId: null,
      cbspRoleId: null,
      rankRoleIds: {},
    },
    robloxIndex: {},
    users: {},
    policeRecruitmentPanels: {},
    pendingVehicles: {},
    pendingHouses: {},
    houseAuctions: {},
    roleplaySession: null,
  };
}

function load() {
  try {
    const raw = fs.readFileSync(config.registryPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      config: { ...defaultRegistry().config, ...(parsed.config || {}) },
      robloxIndex: parsed.robloxIndex || {},
      users: parsed.users || {},
      policeRecruitmentPanels: parsed.policeRecruitmentPanels || {},
      pendingVehicles: parsed.pendingVehicles || {},
      pendingHouses: parsed.pendingHouses || {},
      houseAuctions: parsed.houseAuctions || {},
      roleplaySession: parsed.roleplaySession || null,
    };
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Błąd podczas wczytywania rejestru, używam pustego:', error);
    }
    return defaultRegistry();
  }
}

function save(data) {
  const dir = path.dirname(config.registryPath);
  fs.mkdirSync(dir, { recursive: true });
  const tmpPath = `${config.registryPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, config.registryPath);
}

function mutate(fn) {
  const data = load();
  const result = fn(data);
  save(data);
  return result;
}

// Jak w prawdziwym polskim systemie: 24 aktywne punkty karne = automatyczne
// zawieszenie prawa jazdy. Na potrzeby RP punkty "kasują się" po tygodniu od
// wystawienia mandatu (zamiast realnego roku) - inaczej ciążyłyby na graczu
// całą sezonową rozgrywkę.
const MAX_POINTS_BEFORE_SUSPENSION = 24;
const POINTS_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

function defaultUser() {
  return {
    discordTag: null,
    robloxUsernames: [],
    idCard: null,
    license: { categories: [], suspended: false, suspendedReason: null, suspendedAt: null },
    vehicles: [],
    organizations: [],
    houses: [],
    citations: [],
    wanted: null,
    police: { rank: null, cbsp: false, dutyStart: null, totalDutyMs: 0 },
  };
}

function calculateActivePoints(user, now = Date.now()) {
  if (!user) return 0;
  return user.citations
    .filter((citation) => now - citation.issuedAt <= POINTS_EXPIRY_MS)
    .reduce((sum, citation) => sum + Number(citation.points || 0), 0);
}

function ensureUser(data, discordId, discordTag) {
  // Merge z domyslnym uzytkownikiem tez dla juz istniejacych wpisow - dzieki
  // temu dodanie nowego pola (np. "organizations") w kolejnej wersji bota nie
  // wywala starszych rekordow zapisanych na dysku przed ta zmiana.
  data.users[discordId] = { ...defaultUser(), ...(data.users[discordId] || {}) };
  if (discordTag) {
    data.users[discordId].discordTag = discordTag;
  }
  return data.users[discordId];
}

function linkRoblox(discordId, discordTag, robloxUsername) {
  mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    if (!user.robloxUsernames.some((name) => name.toLowerCase() === robloxUsername.toLowerCase())) {
      user.robloxUsernames.push(robloxUsername);
    }
    data.robloxIndex[robloxUsername.toLowerCase()] = discordId;
  });
}

function findDiscordIdByRobloxNick(nick) {
  const data = load();
  return data.robloxIndex[nick.toLowerCase()] || null;
}

function getUserRecord(discordId) {
  const data = load();
  return data.users[discordId] || null;
}

function normalizePlate(plateNumber) {
  return plateNumber.toUpperCase().replace(/\s+/g, '');
}

// Szuka pojazdu po numerze rejestracyjnym po wszystkich zarejestrowanych
// uzytkownikach - normalizuje wielkosc liter i spacje, zeby "GD X1234" i
// "gdx1234" trafialy w ten sam wpis.
function findVehicleByPlate(plateNumber) {
  const data = load();
  const target = normalizePlate(plateNumber);

  for (const [discordId, user] of Object.entries(data.users)) {
    const vehicle = user.vehicles.find((v) => normalizePlate(v.plateNumber) === target);
    if (vehicle) {
      return { discordId, discordTag: user.discordTag, vehicle };
    }
  }

  return null;
}

function recordIdCard(discordId, discordTag, { fullName, age, citizenship, idNumber, robloxUsername }) {
  mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    user.idCard = { fullName, age, citizenship, idNumber, robloxUsername, recordedAt: Date.now() };
    if (robloxUsername && !user.robloxUsernames.some((n) => n.toLowerCase() === robloxUsername.toLowerCase())) {
      user.robloxUsernames.push(robloxUsername);
    }
    if (robloxUsername) {
      data.robloxIndex[robloxUsername.toLowerCase()] = discordId;
    }
  });
}

function recordLicenseCategory(discordId, discordTag, { category, licenseNumber, robloxUsername }) {
  mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    user.license.categories.push({ category, licenseNumber, issuedAt: Date.now() });
    if (robloxUsername && !user.robloxUsernames.some((n) => n.toLowerCase() === robloxUsername.toLowerCase())) {
      user.robloxUsernames.push(robloxUsername);
    }
    if (robloxUsername) {
      data.robloxIndex[robloxUsername.toLowerCase()] = discordId;
    }
  });
}

function recordVehicle(discordId, discordTag, { make, year, color, engine, category, plateNumber, vin }) {
  mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    user.vehicles.push({ make, year, color, engine, category, plateNumber, vin, registeredAt: Date.now() });
  });
}

function recordMafiaOrg(discordId, discordTag, { name, owner, coOwner, color, size, orgNumber, location }) {
  mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    user.organizations.push({ name, owner, coOwner, color, size, orgNumber, location, registeredAt: Date.now() });
  });
}

function recordHouse(
  discordId,
  discordTag,
  { category, owner, location, address, price, rooms, area, yearBuilt, garage, pool, description, houseNumber }
) {
  mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    user.houses.push({
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
      registeredAt: Date.now(),
    });
  });
}

function addCitation(discordId, discordTag, { reason, amount, points, issuedBy, issuedByTag }) {
  return mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    const issuedAt = Date.now();
    user.citations.push({ reason, amount, points, issuedBy, issuedByTag, issuedAt });

    const activePoints = calculateActivePoints(user, issuedAt);
    let autoSuspended = false;
    if (activePoints >= MAX_POINTS_BEFORE_SUSPENSION && !user.license.suspended) {
      user.license.suspended = true;
      user.license.suspendedReason = `Automatyczne zawieszenie — przekroczono ${MAX_POINTS_BEFORE_SUSPENSION} aktywnych punktów karnych.`;
      user.license.suspendedBy = null;
      user.license.suspendedById = null;
      user.license.suspendedAt = issuedAt;
      autoSuspended = true;
    }

    return { activePoints, autoSuspended };
  });
}

function getActivePoints(discordId) {
  const data = load();
  return calculateActivePoints(data.users[discordId], Date.now());
}

function setWanted(discordId, discordTag, { reason, issuedBy, issuedByTag }) {
  mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    user.wanted = { reason, issuedBy, issuedByTag, issuedAt: Date.now() };
  });
}

function clearWanted(discordId) {
  return mutate((data) => {
    const user = data.users[discordId];
    if (!user || !user.wanted) return false;
    user.wanted = null;
    return true;
  });
}

function setLicenseSuspended(discordId, discordTag, suspended, { reason, issuedBy, issuedByTag } = {}) {
  mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    user.license.suspended = suspended;
    user.license.suspendedReason = suspended ? reason || null : null;
    user.license.suspendedBy = suspended ? issuedByTag || null : null;
    user.license.suspendedAt = suspended ? Date.now() : null;
    if (issuedBy) user.license.suspendedById = suspended ? issuedBy : null;
  });
}

function startDuty(discordId, discordTag) {
  return mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    if (user.police.dutyStart) return { alreadyOnDuty: true };
    user.police.dutyStart = Date.now();
    return { alreadyOnDuty: false };
  });
}

function endDuty(discordId, discordTag) {
  return mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    if (!user.police.dutyStart) return { notOnDuty: true };
    const durationMs = Date.now() - user.police.dutyStart;
    user.police.totalDutyMs += durationMs;
    user.police.dutyStart = null;
    return { notOnDuty: false, durationMs, totalDutyMs: user.police.totalDutyMs };
  });
}

function getDutyStatus(discordId) {
  const data = load();
  const user = data.users[discordId];
  if (!user) return { onDuty: false, dutyStart: null, totalDutyMs: 0 };
  return {
    onDuty: Boolean(user.police.dutyStart),
    dutyStart: user.police.dutyStart,
    totalDutyMs: user.police.totalDutyMs,
  };
}

function getDutyRanking(limit = 10) {
  const data = load();
  const now = Date.now();
  return Object.entries(data.users)
    .map(([discordId, user]) => {
      const liveMs = user.police.dutyStart ? now - user.police.dutyStart : 0;
      return {
        discordId,
        discordTag: user.discordTag,
        rank: user.police.rank,
        onDuty: Boolean(user.police.dutyStart),
        totalDutyMs: user.police.totalDutyMs + liveMs,
      };
    })
    .filter((entry) => entry.totalDutyMs > 0 || entry.onDuty)
    .sort((a, b) => b.totalDutyMs - a.totalDutyMs)
    .slice(0, limit);
}

function setRank(discordId, discordTag, rankKey) {
  mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    user.police.rank = rankKey;
  });
}

function getRank(discordId) {
  const data = load();
  const user = data.users[discordId];
  return user ? user.police.rank : null;
}

function setCbsp(discordId, discordTag, value) {
  mutate((data) => {
    const user = ensureUser(data, discordId, discordTag);
    user.police.cbsp = value;
  });
}

function getConfig() {
  return load().config;
}

function setConfig(partial) {
  mutate((data) => {
    data.config = { ...data.config, ...partial };
  });
}

// Discord ograniczaja customId do 100 znakow, a egzamin wiedzy dla KMP musi
// przeniesc kategorie/role-obslugi/role-po-akceptacji przez ~10 kolejnych
// przyciskow z pytaniami - trzy pelne snowflaki nie zmiescilyby sie w
// limicie. Zamiast tego zapisujemy je raz w rejestrze pod krotkim ID, a w
// customId przyciskow leci tylko ten krotki ID.
function savePoliceRecruitmentPanel({ categoryId, supportRoleId, acceptRoleId }) {
  return mutate((data) => {
    const panelId = Math.random().toString(36).slice(2, 8);
    data.policeRecruitmentPanels[panelId] = { categoryId, supportRoleId, acceptRoleId: acceptRoleId || null };
    return panelId;
  });
}

function getPoliceRecruitmentPanel(panelId) {
  const data = load();
  return data.policeRecruitmentPanels[panelId] || null;
}

// Modal rejestracji pojazdu ma juz 5 pol (limit Discorda), wiec numer
// rejestracyjny podawany recznie przez gracza zbiera drugi modal. Dane z
// pierwszego modala trzymane sa krotko pod losowym pendingId - usuwane od
// razu po odebraniu (jednorazowe, w przeciwienstwie do panelow rekrutacji).
function savePendingVehicle(data) {
  return mutate((registryData) => {
    const pendingId = Math.random().toString(36).slice(2, 8);
    registryData.pendingVehicles[pendingId] = data;
    return pendingId;
  });
}

function getPendingVehicle(pendingId) {
  const data = load();
  return data.pendingVehicles[pendingId] || null;
}

function deletePendingVehicle(pendingId) {
  mutate((data) => {
    delete data.pendingVehicles[pendingId];
  });
}

// Modal rejestracji domu (/panel zaloz-dom) ma juz 5 pol (limit Discorda),
// wiec dodatkowe szczegoly (powierzchnia/rok/garaz/basen/opis) zbiera drugi
// modal - dane z pierwszego trzymane sa krotko pod losowym pendingId, tak
// samo jak przy rejestracji pojazdu.
function savePendingHouse(data) {
  return mutate((registryData) => {
    const pendingId = Math.random().toString(36).slice(2, 8);
    registryData.pendingHouses[pendingId] = data;
    return pendingId;
  });
}

function getPendingHouse(pendingId) {
  const data = load();
  return data.pendingHouses[pendingId] || null;
}

function deletePendingHouse(pendingId) {
  mutate((data) => {
    delete data.pendingHouses[pendingId];
  });
}

// Aukcje domow (/panel aukcja-domow). W przeciwienstwie do dowodow/pojazdow,
// stan aukcji (aktualna najwyzsza oferta, kto licytuje, czy jest aktywna)
// zyje dluzej niz jedna interakcje, wiec trzymany jest caly czas w rejestrze
// pod krotkim auctionId - embed ogloszenia jest budowany od nowa z tego
// stanu przy kazdej zmianie (nowa oferta, koniec aukcji).
function startHouseAuction({ channelId, house, location, description, startingPrice, minIncrement, auctioneerId, auctioneerTag }) {
  return mutate((data) => {
    const auctionId = Math.random().toString(36).slice(2, 8);
    data.houseAuctions[auctionId] = {
      channelId,
      messageId: null,
      house,
      location,
      description,
      startingPrice,
      minIncrement,
      auctioneerId,
      auctioneerTag,
      highestBid: null,
      highestBidderId: null,
      highestBidderTag: null,
      status: 'active',
      createdAt: Date.now(),
      endedAt: null,
    };
    return auctionId;
  });
}

function setAuctionMessageId(auctionId, messageId) {
  mutate((data) => {
    const auction = data.houseAuctions[auctionId];
    if (auction) auction.messageId = messageId;
  });
}

function getHouseAuction(auctionId) {
  const data = load();
  return data.houseAuctions[auctionId] || null;
}

function placeBid(auctionId, { bidderId, bidderTag, amount }) {
  return mutate((data) => {
    const auction = data.houseAuctions[auctionId];
    if (!auction) return { ok: false, reason: 'not_found' };
    if (auction.status !== 'active') return { ok: false, reason: 'ended' };

    const minRequired = auction.highestBid !== null ? auction.highestBid + auction.minIncrement : auction.startingPrice;
    if (amount < minRequired) return { ok: false, reason: 'too_low', minRequired };

    auction.highestBid = amount;
    auction.highestBidderId = bidderId;
    auction.highestBidderTag = bidderTag;
    return { ok: true, auction: { ...auction } };
  });
}

function endHouseAuction(auctionId, { endedBy, endedByTag }) {
  return mutate((data) => {
    const auction = data.houseAuctions[auctionId];
    if (!auction) return { ok: false, reason: 'not_found' };
    if (auction.status !== 'active') return { ok: false, reason: 'already_ended' };

    auction.status = 'ended';
    auction.endedAt = Date.now();
    auction.endedBy = endedBy;
    auction.endedByTag = endedByTag;
    return { ok: true, auction: { ...auction } };
  });
}

// Jedna, globalna sesja RP na caly serwer (nie per-uzytkownik jak sluzba
// policyjna) - /roleplay start/stop. Kod sesji jest stale ustalony
// (config.roleplaySessionCode), nie losowany za kazdym razem.
function startRoleplaySession(discordId, discordTag) {
  return mutate((data) => {
    if (data.roleplaySession) {
      return { alreadyActive: true, session: data.roleplaySession };
    }
    const session = { code: config.roleplaySessionCode, startedBy: discordId, startedByTag: discordTag, startedAt: Date.now() };
    data.roleplaySession = session;
    return { alreadyActive: false, session };
  });
}

function stopRoleplaySession(discordId, discordTag) {
  return mutate((data) => {
    if (!data.roleplaySession) {
      return { notActive: true };
    }
    const session = data.roleplaySession;
    const durationMs = Date.now() - session.startedAt;
    data.roleplaySession = null;
    return { notActive: false, session, durationMs, stoppedBy: discordId, stoppedByTag: discordTag };
  });
}

function getRoleplaySession() {
  return load().roleplaySession;
}

module.exports = {
  linkRoblox,
  findDiscordIdByRobloxNick,
  getUserRecord,
  findVehicleByPlate,
  savePendingVehicle,
  getPendingVehicle,
  deletePendingVehicle,
  savePendingHouse,
  getPendingHouse,
  deletePendingHouse,
  startHouseAuction,
  setAuctionMessageId,
  getHouseAuction,
  placeBid,
  endHouseAuction,
  startRoleplaySession,
  stopRoleplaySession,
  getRoleplaySession,
  recordIdCard,
  recordLicenseCategory,
  recordVehicle,
  recordMafiaOrg,
  recordHouse,
  addCitation,
  getActivePoints,
  MAX_POINTS_BEFORE_SUSPENSION,
  setWanted,
  clearWanted,
  setLicenseSuspended,
  startDuty,
  endDuty,
  getDutyStatus,
  getDutyRanking,
  setRank,
  getRank,
  setCbsp,
  getConfig,
  setConfig,
  savePoliceRecruitmentPanel,
  getPoliceRecruitmentPanel,
};
