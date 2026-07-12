const fs = require('fs');
const path = require('path');
const config = require('../config');

// Jedyny w calym bocie modul trzymajacy stan poza Discordem - trwaly rejestr
// dowodow/pojazdow/domow/aukcji, zapisywany do pliku JSON (sciezka:
// config.registryPath). Na Railway wymaga podpietego Volume, w przeciwnym
// razie dane znikaja przy kazdym redeployu (patrz README).
//
// Prosty wzorzec read-modify-write: kazda mutacja wczytuje caly plik,
// modyfikuje obiekt w pamieci i zapisuje z powrotem (najpierw do pliku
// tymczasowego, potem atomowy rename) - ruch jest na tyle maly (komendy
// Discorda), ze nie potrzeba nic bardziej wyrafinowanego niz fs *Sync.

function defaultRegistry() {
  return {
    robloxIndex: {},
    users: {},
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
      robloxIndex: parsed.robloxIndex || {},
      users: parsed.users || {},
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

function defaultUser() {
  return {
    discordTag: null,
    robloxUsernames: [],
    idCard: null,
    vehicles: [],
    organizations: [],
    houses: [],
  };
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

// Jedna, globalna sesja RP na caly serwer (nie per-uzytkownik) - /roleplay
// start/stop. Kod sesji jest stale ustalony (config.roleplaySessionCode),
// nie losowany za kazdym razem.
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
  recordVehicle,
  recordMafiaOrg,
  recordHouse,
};
