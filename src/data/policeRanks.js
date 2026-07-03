// Drabinka awansow Policji RP. Kolejnosc ma znaczenie - index w tej tablicy
// to "poziom" rangi uzywany przez /policja awans i /policja degradacja.
// CBSP nie jest czescia tej drabinki - to osobna, prestizowa jednostka
// przydzielana/odbierana niezaleznie komenda /policja cbsp.
const RANKS = [
  { key: 'kadet', label: 'Kadet' },
  { key: 'posterunkowy', label: 'Posterunkowy' },
  { key: 'sierzant', label: 'Sierżant' },
  { key: 'aspirant', label: 'Aspirant' },
  { key: 'komisarz', label: 'Komisarz' },
  { key: 'nadkomisarz', label: 'Nadkomisarz' },
  { key: 'komendant', label: 'Komendant' },
];

function getRankIndex(key) {
  return RANKS.findIndex((rank) => rank.key === key);
}

function getRankByIndex(index) {
  return RANKS[index] || null;
}

function getRankLabel(key) {
  const rank = RANKS.find((r) => r.key === key);
  return rank ? rank.label : 'Brak rangi';
}

module.exports = { RANKS, getRankIndex, getRankByIndex, getRankLabel };
