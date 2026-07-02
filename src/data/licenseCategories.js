// Pelna lista kategorii prawa jazdy (jak w polskim systemie) wraz z
// minimalnym wiekiem wymaganym do przystapienia do egzaminu.
const LICENSE_CATEGORIES = [
  { value: 'AM', description: 'Motorower, czterokołowiec lekki (od 14 lat)', minAge: 14 },
  { value: 'A1', description: 'Motocykl do 125 cm³ (od 16 lat)', minAge: 16 },
  { value: 'B1', description: 'Czterokołowiec (od 16 lat)', minAge: 16 },
  { value: 'T', description: 'Ciągnik rolniczy (od 16 lat)', minAge: 16 },
  { value: 'A2', description: 'Motocykl o mocy do 35 kW (od 18 lat)', minAge: 18 },
  { value: 'B', description: 'Samochód osobowy (od 18 lat)', minAge: 18 },
  { value: 'B+E', description: 'Samochód osobowy z przyczepą (od 18 lat)', minAge: 18 },
  { value: 'C1', description: 'Samochód ciężarowy do 7,5 t (od 18 lat)', minAge: 18 },
  { value: 'C1+E', description: 'Samochód ciężarowy do 7,5 t z przyczepą (od 18 lat)', minAge: 18 },
  { value: 'A', description: 'Motocykl bez ograniczeń (od 20 lat)', minAge: 20 },
  { value: 'C', description: 'Samochód ciężarowy (od 21 lat)', minAge: 21 },
  { value: 'C+E', description: 'Samochód ciężarowy z przyczepą (od 21 lat)', minAge: 21 },
  { value: 'D1', description: 'Autobus do 16 miejsc (od 21 lat)', minAge: 21 },
  { value: 'D1+E', description: 'Autobus do 16 miejsc z przyczepą (od 21 lat)', minAge: 21 },
  { value: 'D', description: 'Autobus (od 24 lat)', minAge: 24 },
  { value: 'D+E', description: 'Autobus z przyczepą (od 24 lat)', minAge: 24 },
];

function getCategoryMinAge(categoryValue) {
  const category = LICENSE_CATEGORIES.find((c) => c.value === categoryValue);
  return category ? category.minAge : 0;
}

module.exports = { LICENSE_CATEGORIES, getCategoryMinAge };
