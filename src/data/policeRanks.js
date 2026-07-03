// Pelna, realistyczna drabinka awansow Policji RP (na wzor struktury Komendy
// Stolecznej Policji) - kolejnosc ma znaczenie, index w tej tablicy to
// "poziom" rangi uzywany przez /policja awans i /policja degradacja.
// CBSP nie jest czescia tej drabinki - to osobna, prestizowa jednostka
// przydzielana/odbierana niezaleznie komenda /policja cbsp.
const RANKS = [
  { key: 'aplikant', label: 'Aplikant' },
  { key: 'posterunkowy', label: 'Posterunkowy' },
  { key: 'starszy-posterunkowy', label: 'Starszy Posterunkowy' },
  { key: 'sierzant', label: 'Sierżant' },
  { key: 'starszy-sierzant', label: 'Starszy Sierżant' },
  { key: 'sierzant-sztabowy', label: 'Sierżant Sztabowy' },
  { key: 'mlodszy-aspirant', label: 'Młodszy Aspirant' },
  { key: 'aspirant', label: 'Aspirant' },
  { key: 'starszy-aspirant', label: 'Starszy Aspirant' },
  { key: 'aspirant-sztabowy', label: 'Aspirant Sztabowy' },
  { key: 'podkomisarz', label: 'Podkomisarz' },
  { key: 'komisarz', label: 'Komisarz' },
  { key: 'nadkomisarz', label: 'Nadkomisarz' },
  { key: 'podinspektor', label: 'Podinspektor' },
  { key: 'mlodszy-inspektor', label: 'Młodszy Inspektor' },
  { key: 'inspektor', label: 'Inspektor' },
  { key: 'nadinspektor', label: 'Nadinspektor' },
  { key: 'generalny-inspektor', label: 'Generalny Inspektor' },
  { key: 'asystent-komendanta', label: 'Asystent Komendanta Stołecznego' },
  { key: 'zastepca-komendanta', label: 'Zastępca Komendanta Stołecznego' },
  { key: 'komendant-stoleczny', label: 'Komendant Stołeczny Policji' },
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
