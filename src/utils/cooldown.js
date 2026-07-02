// Cooldown trzymany w pamieci procesu - celowo nie przetrwa restartu
// bota (to akceptowalne dla samego cooldownu, w przeciwienstwie do
// przebiegu egzaminu/podania, ktory musi przetrwac restart).
function createCooldown(durationMs) {
  const cooldowns = new Map(); // userId -> timestamp (ms) konca cooldownu

  function setCooldown(userId) {
    cooldowns.set(userId, Date.now() + durationMs);
  }

  /**
   * Zwraca timestamp (ms) konca cooldownu, albo null jesli cooldown
   * juz minal lub nigdy nie zostal ustawiony.
   */
  function getCooldownExpiresAt(userId) {
    const expiresAt = cooldowns.get(userId);
    if (!expiresAt) return null;

    if (expiresAt <= Date.now()) {
      cooldowns.delete(userId);
      return null;
    }

    return expiresAt;
  }

  return { setCooldown, getCooldownExpiresAt };
}

const COOLDOWN_MS = 15 * 60 * 1000; // 15 minut po oblanym egzaminie
const examCooldown = createCooldown(COOLDOWN_MS);

const APPLICATION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h po odrzuconym podaniu
const applicationCooldown = createCooldown(APPLICATION_COOLDOWN_MS);

module.exports = {
  setFailureCooldown: examCooldown.setCooldown,
  getCooldownExpiresAt: examCooldown.getCooldownExpiresAt,
  COOLDOWN_MS,
  setApplicationRejectionCooldown: applicationCooldown.setCooldown,
  getApplicationCooldownExpiresAt: applicationCooldown.getCooldownExpiresAt,
  APPLICATION_COOLDOWN_MS,
};
