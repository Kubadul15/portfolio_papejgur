const { PermissionFlagsBits } = require('discord.js');
const { getRankIndex, RANKS } = require('../data/policeRanks');

// Dostep do /policja sprawdz-gracza/mandat/goniony/zawieszenie/sluzba/ranking
// wymaga skonfigurowanej roli "Policja" (ustawianej przez /policja setup).
// Dostep do awans/degradacja/cbsp/setup jest wyzszy - Manage Server albo
// najwyzsza ranga (Komendant) na drabince.
function hasPoliceRole(member, policeRoleId) {
  return Boolean(policeRoleId) && member.roles.cache.has(policeRoleId);
}

function isCommander(member, config) {
  if (member.permissions.has(PermissionFlagsBits.ManageGuild)) return true;
  const komendantRoleId = config.rankRoleIds && config.rankRoleIds[RANKS[RANKS.length - 1].key];
  return Boolean(komendantRoleId) && member.roles.cache.has(komendantRoleId);
}

async function requirePoliceRole(interaction, config) {
  if (!config.policeRoleId) {
    await interaction.reply({
      content: '⚠️ System policyjny nie został jeszcze skonfigurowany — użyj najpierw `/policja setup`.',
      ephemeral: true,
    });
    return false;
  }
  if (!hasPoliceRole(interaction.member, config.policeRoleId)) {
    await interaction.reply({
      content: `❌ Ta komenda wymaga roli <@&${config.policeRoleId}>.`,
      ephemeral: true,
    });
    return false;
  }
  return true;
}

async function requireCommander(interaction, config) {
  if (!isCommander(interaction.member, config)) {
    await interaction.reply({
      content: '❌ Ta komenda wymaga uprawnień Zarządzaj Serwerem albo rangi Komendanta.',
      ephemeral: true,
    });
    return false;
  }
  return true;
}

function getRankKeyFromRoles(member, rankRoleIds) {
  for (let i = RANKS.length - 1; i >= 0; i -= 1) {
    const roleId = rankRoleIds[RANKS[i].key];
    if (roleId && member.roles.cache.has(roleId)) {
      return RANKS[i].key;
    }
  }
  return null;
}

module.exports = { hasPoliceRole, isCommander, requirePoliceRole, requireCommander, getRankKeyFromRoles, getRankIndex };
