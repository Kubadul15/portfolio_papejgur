const fs = require('fs');
const path = require('path');
const config = require('../config');

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
    roleplaySession: null,
    aktywnoscSessions: {},
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
      roleplaySession: parsed.roleplaySession || null,
      aktywnoscSessions: parsed.aktywnoscSessions || {},
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

function startRoleplaySession(discordId, discordTag, customCode) {
  return mutate((data) => {
    if (data.roleplaySession) {
      return { alreadyActive: true, session: data.roleplaySession };
    }
    const code = (customCode && customCode.trim()) || config.roleplaySessionCode;
    const session = { code, startedBy: discordId, startedByTag: discordTag, startedAt: Date.now() };
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

// Sesje aktywnosci - kazda trzymana pod ID wiadomosci ogloszenia. "order"
// to lista ID uzytkownikow w kolejnosci, w jakiej zareagowali wybrana
// emotka - pierwsze 3 miejsca dostaja medale w embedzie.
function createAktywnoscSession(messageId, { channelId, emoji, cel, rola, notatka, createdBy }) {
  mutate((data) => {
    data.aktywnoscSessions[messageId] = {
      channelId,
      emoji,
      cel,
      rola: rola || null,
      notatka: notatka || null,
      createdBy,
      order: [],
    };
  });
}

function addAktywnoscReaction(messageId, userId) {
  return mutate((data) => {
    const session = data.aktywnoscSessions[messageId];
    if (!session) return null;
    if (!session.order.includes(userId)) {
      session.order.push(userId);
    }
    return { ...session };
  });
}

function removeAktywnoscReaction(messageId, userId) {
  return mutate((data) => {
    const session = data.aktywnoscSessions[messageId];
    if (!session) return null;
    session.order = session.order.filter((id) => id !== userId);
    return { ...session };
  });
}

function getAktywnoscSession(messageId) {
  const data = load();
  return data.aktywnoscSessions[messageId] || null;
}

module.exports = {
  linkRoblox,
  findDiscordIdByRobloxNick,
  getUserRecord,
  findVehicleByPlate,
  savePendingVehicle,
  getPendingVehicle,
  deletePendingVehicle,
  startRoleplaySession,
  stopRoleplaySession,
  getRoleplaySession,
  recordIdCard,
  recordLicenseCategory,
  recordVehicle,
  recordMafiaOrg,
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
  createAktywnoscSession,
  addAktywnoscReaction,
  removeAktywnoscReaction,
  getAktywnoscSession,
};
