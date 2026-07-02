const USERNAME_LOOKUP_URL = 'https://users.roblox.com/v1/usernames/users';
const AVATAR_THUMBNAIL_URL = 'https://thumbnails.roblox.com/v1/users/avatar-headshot';

/**
 * Sprawdza podany nick w publicznym API Roblox (bez logowania).
 * Zwraca null, jesli konto o takim nicku nie istnieje.
 */
async function lookupRobloxUser(username) {
  const response = await fetch(USERNAME_LOOKUP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
  });

  if (!response.ok) {
    throw new Error(`Roblox API (usernames) odpowiedzialo statusem ${response.status}`);
  }

  const payload = await response.json();
  const match = payload.data && payload.data[0];
  if (!match) {
    return null;
  }

  return {
    id: match.id,
    name: match.name,
    displayName: match.displayName,
  };
}

/**
 * Pobiera URL avatara (headshot) dla danego ID uzytkownika Roblox.
 */
async function getAvatarHeadshotUrl(userId) {
  const url = `${AVATAR_THUMBNAIL_URL}?userIds=${userId}&size=420x420&format=Png&isCircular=false`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Roblox API (thumbnails) odpowiedzialo statusem ${response.status}`);
  }

  const payload = await response.json();
  const match = payload.data && payload.data[0];
  return match && match.state === 'Completed' ? match.imageUrl : null;
}

/**
 * Laczy wyszukanie uzytkownika i pobranie avatara w jednym wywolaniu.
 * Zwraca null, jesli nick nie istnieje na Roblox.
 */
async function verifyRobloxUsername(username) {
  const user = await lookupRobloxUser(username);
  if (!user) {
    return null;
  }

  const avatarUrl = await getAvatarHeadshotUrl(user.id);
  return { ...user, avatarUrl };
}

module.exports = { lookupRobloxUser, getAvatarHeadshotUrl, verifyRobloxUsername };
