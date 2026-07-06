/**
 * Parsuje wiek podany przez gracza. Zwraca liczbe calkowita 1-100
 * albo null, jesli wartosc jest nieprawidlowa (np. tekst, ulamek,
 * liczba ujemna albo absurdalnie duza).
 */
function parseAge(rawAge) {
  if (!/^\d{1,3}$/.test(rawAge.trim())) return null;
  const age = Number(rawAge);
  if (!Number.isInteger(age) || age < 1 || age > 100) return null;
  return age;
}

/**
 * Parsuje rok produkcji pojazdu. Zwraca liczbe calkowita w rozsadnym
 * zakresie (1900 - obecny rok + 1) albo null, jesli nieprawidlowa.
 */
function parseYear(rawYear) {
  if (!/^\d{4}$/.test(rawYear.trim())) return null;
  const year = Number(rawYear);
  const maxYear = new Date().getFullYear() + 1;
  if (!Number.isInteger(year) || year < 1900 || year > maxYear) return null;
  return year;
}

/**
 * Parsuje numer rejestracyjny pojazdu podany przez gracza. Zwraca
 * znormalizowany (wielkie litery, przycieta biala spacja) numer albo
 * null, jesli zawiera niedozwolone znaki lub ma nieprawidlowa dlugosc.
 */
function parsePlateNumber(rawPlate) {
  const trimmed = rawPlate.trim().toUpperCase();
  if (!/^[A-Z0-9 -]{3,12}$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Parsuje kwote (cena domu, aukcja, podbitka) podana przez gracza. Usuwa
 * spacje/separatory tysiecy, akceptuje przecinek jako separator dziesietny,
 * zwraca liczbe > 0 albo null, jesli nieprawidlowa.
 */
function parsePrice(rawPrice) {
  const trimmed = rawPrice.trim();
  if (!/^[\d\s.,]+$/.test(trimmed)) return null;
  const normalized = trimmed.replace(/\s+/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const price = Number(normalized);
  if (!Number.isFinite(price) || price <= 0 || price > 100000000) return null;
  return price;
}

/**
 * Parsuje liczbe pokoi domu. Zwraca liczbe calkowita 1-20 albo null.
 */
function parseRooms(rawRooms) {
  if (!/^\d{1,2}$/.test(rawRooms.trim())) return null;
  const rooms = Number(rawRooms);
  if (!Number.isInteger(rooms) || rooms < 1 || rooms > 20) return null;
  return rooms;
}

/**
 * Parsuje powierzchnie domu w m2. Zwraca liczbe 10-5000 albo null.
 */
function parseArea(rawArea) {
  const cleaned = rawArea.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const area = Number(cleaned);
  if (!Number.isFinite(area) || area < 10 || area > 5000) return null;
  return area;
}

/**
 * Parsuje odpowiedz tak/nie (np. garaz, basen). Zwraca true/false albo
 * null, jesli wartosc nie jest rozpoznawalnym "tak"/"nie".
 */
function parseYesNo(rawValue) {
  const normalized = rawValue.trim().toLowerCase();
  if (['tak', 't', 'yes', 'y'].includes(normalized)) return true;
  if (['nie', 'n', 'no'].includes(normalized)) return false;
  return null;
}

module.exports = { parseAge, parseYear, parsePlateNumber, parsePrice, parseRooms, parseArea, parseYesNo };
