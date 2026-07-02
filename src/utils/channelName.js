/**
 * Sanityzuje nazwe uzytkownika do bezpiecznej nazwy kanalu Discord
 * (male litery, cyfry, myslniki) z podanym prefiksem.
 */
function buildSlugChannelName(prefix, username) {
  const sanitized = username
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${prefix}-${sanitized || 'user'}`.slice(0, 90);
}

module.exports = { buildSlugChannelName };
