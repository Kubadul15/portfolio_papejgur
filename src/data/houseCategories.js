// Typy nieruchomości dostępne przy rejestracji domu przez /panel zaloz-dom.
const HOUSE_CATEGORIES = [
  { value: 'Kawalerka', description: 'Mała nieruchomość 1-pokojowa' },
  { value: 'Mieszkanie', description: 'Standardowe mieszkanie w bloku/kamienicy' },
  { value: 'Szeregowiec', description: 'Dom w zabudowie szeregowej' },
  { value: 'Dom Jednorodzinny', description: 'Wolnostojący dom dla jednej rodziny' },
  { value: 'Willa', description: 'Duży, luksusowy dom z ogrodem' },
  { value: 'Rezydencja', description: 'Ekskluzywna posiadłość z dużą działką' },
  { value: 'Penthouse', description: 'Luksusowy apartament na najwyższym piętrze' },
];

module.exports = { HOUSE_CATEGORIES };
