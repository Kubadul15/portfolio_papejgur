// Pula PODSTAWOWYCH pytan do egzaminu dla kandydatow do WRD (Wydzial Ruchu
// Drogowego) w ramach KMP - lzejszy poziom niz glowny egzamin do KMP,
// skupiony na podstawach ruchu drogowego i pracy patrolu drogowego.
const WRD_EXAM_QUESTIONS = [
  {
    question: 'Co oznacza skrót WRD?',
    answers: ['Wydział Ruchu Drogowego', 'Wydział Reagowania Dyżurnego', 'Wydział Rejestracji Dokumentów', 'Wydział Realizacji Dochodzeń'],
    correctIndex: 0,
  },
  {
    question: 'Jaka jest dopuszczalna prędkość w terenie zabudowanym w porze dziennej?',
    answers: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'],
    correctIndex: 1,
  },
  {
    question: 'Jaka jest dopuszczalna prędkość w terenie zabudowanym w porze nocnej (23:00-5:00)?',
    answers: ['50 km/h', '60 km/h', '70 km/h', 'Bez ograniczeń'],
    correctIndex: 2,
  },
  {
    question: 'Jakie dokumenty standardowo sprawdza policjant podczas kontroli drogowej?',
    answers: [
      'Tylko dowód osobisty',
      'Prawo jazdy, dowód rejestracyjny, potwierdzenie OC',
      'Tylko prawo jazdy',
      'Żadnych, wystarczy wygląd pojazdu',
    ],
    correctIndex: 1,
  },
  {
    question: 'Co oznacza czerwone światło sygnalizacji świetlnej?',
    answers: ['Jazda dozwolona z ostrożnością', 'Zakaz wjazdu za sygnalizator', 'Ustąpienie pierwszeństwa', 'Zwolnienie do 20 km/h'],
    correctIndex: 1,
  },
  {
    question: 'Co oznacza znak "STOP"?',
    answers: [
      'Zwolnij i jedź dalej, jeśli droga wolna',
      'Bezwzględny obowiązek zatrzymania pojazdu',
      'Zakaz zawracania',
      'Koniec strefy zamieszkania',
    ],
    correctIndex: 1,
  },
  {
    question: 'Kiedy kierowca może użyć sygnałów świetlnych i dźwiękowych pojazdu uprzywilejowanego?',
    answers: [
      'W każdej chwili, gdy się spieszy',
      'Tylko podczas jazdy do bazy',
      'Podczas wykonywania pilnych czynności służbowych, zgodnie z przepisami',
      'Nigdy, to zabronione',
    ],
    correctIndex: 2,
  },
  {
    question: 'Czym różni się kolizja drogowa od wypadku drogowego?',
    answers: [
      'Niczym, to te same pojęcia',
      'W wypadku są ranni lub zabici, w kolizji tylko szkody materialne',
      'Kolizja dotyczy tylko motocykli',
      'Wypadek to zdarzenie bez udziału pojazdów',
    ],
    correctIndex: 1,
  },
  {
    question: 'Co powinien zrobić patrol WRD w pierwszej kolejności po przybyciu na miejsce wypadku drogowego?',
    answers: [
      'Od razu spisać dane świadków',
      'Zabezpieczyć miejsce zdarzenia i udzielić pomocy poszkodowanym',
      'Wezwać laweczkę i odjechać',
      'Poczekać na przyjazd dziennikarzy',
    ],
    correctIndex: 1,
  },
  {
    question: 'Co oznacza żółta przerywana linia pozioma na jezdni?',
    answers: [
      'Tymczasowe oznakowanie zastępujące inne linie (np. w czasie remontu)',
      'Zakaz wyprzedzania',
      'Pas dla autobusów',
      'Koniec jezdni',
    ],
    correctIndex: 0,
  },
  {
    question: 'Jaki jest podstawowy sposób zatrzymania pojazdu do kontroli drogowej przez patrol?',
    answers: [
      'Rzucenie czymś w pojazd',
      'Sygnały świetlne/dźwiękowe oraz gest lub tarcza do zatrzymywania pojazdów',
      'Zajechanie drogi bez ostrzeżenia',
      'Krzyk z otwartego okna',
    ],
    correctIndex: 1,
  },
  {
    question: 'Ile aktywnych punktów karnych w tym systemie prowadzi do automatycznego zawieszenia prawa jazdy?',
    answers: ['12', '18', '24', '30'],
    correctIndex: 2,
  },
  {
    question: 'Co to jest dowód rejestracyjny pojazdu?',
    answers: [
      'Dokument potwierdzający dopuszczenie pojazdu do ruchu i jego dane techniczne',
      'Dokument uprawniający do kierowania pojazdem',
      'Polisa ubezpieczeniowa',
      'Zaświadczenie o niekaralności kierowcy',
    ],
    correctIndex: 0,
  },
  {
    question: 'Co robi funkcjonariusz WRD, gdy kierowca odmawia okazania dokumentów?',
    answers: [
      'Odpuszcza kontrolę',
      'Podejmuje dalsze czynności zgodnie z procedurą (np. ustalenie tożsamości)',
      'Zabiera pojazd bez żadnej podstawy',
      'Nic nie może zrobić',
    ],
    correctIndex: 1,
  },
  {
    question: 'Który wydział w KMP zajmuje się głównie bezpieczeństwem i kontrolą ruchu drogowego?',
    answers: ['CBŚP', 'BOA', 'WRD', 'BSWP'],
    correctIndex: 2,
  },
  {
    question: 'Co należy zrobić przed rozpoczęciem jazdy pojazdem służbowym WRD?',
    answers: [
      'Nic, wystarczy wsiąść i jechać',
      'Sprawdzić stan techniczny pojazdu i wyposażenie',
      'Poinformować media',
      'Poczekać na zgodę komendanta stołecznego',
    ],
    correctIndex: 1,
  },
];

module.exports = { WRD_EXAM_QUESTIONS };
