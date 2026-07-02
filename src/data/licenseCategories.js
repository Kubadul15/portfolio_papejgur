// Pelna lista kategorii prawa jazdy (jak w polskim systemie).
const LICENSE_CATEGORIES = [
  { value: 'AM', description: 'Motorower, czterokołowiec lekki' },
  { value: 'A1', description: 'Motocykl do 125 cm³' },
  { value: 'A2', description: 'Motocykl o mocy do 35 kW' },
  { value: 'A', description: 'Motocykl bez ograniczeń' },
  { value: 'B1', description: 'Czterokołowiec' },
  { value: 'B', description: 'Samochód osobowy' },
  { value: 'B+E', description: 'Samochód osobowy z przyczepą' },
  { value: 'C1', description: 'Samochód ciężarowy do 7,5 t' },
  { value: 'C1+E', description: 'Samochód ciężarowy do 7,5 t z przyczepą' },
  { value: 'C', description: 'Samochód ciężarowy' },
  { value: 'C+E', description: 'Samochód ciężarowy z przyczepą' },
  { value: 'D1', description: 'Autobus do 16 miejsc' },
  { value: 'D1+E', description: 'Autobus do 16 miejsc z przyczepą' },
  { value: 'D', description: 'Autobus' },
  { value: 'D+E', description: 'Autobus z przyczepą' },
  { value: 'T', description: 'Ciągnik rolniczy' },
];

module.exports = { LICENSE_CATEGORIES };
