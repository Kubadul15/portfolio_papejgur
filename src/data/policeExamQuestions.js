// Pula trudnych pytan do egzaminu wiedzy dla kandydatow do KMP - skroty
// jednostek, hierarchia stopni i procedury RP. Losowany jest podzbior przy
// kazdym podejsciu (patrz src/utils/policeExam.js), wiec caly test jest
// bezstanowy - stan przetrwa restart bota, bo jest zakodowany w customId.
const POLICE_EXAM_QUESTIONS = [
  {
    question: 'Co oznacza skrót CBŚP?',
    answers: [
      'Centralne Biuro Śledcze Policji',
      'Centrum Bezpieczeństwa i Śledztw Policyjnych',
      'Centralny Bank Świadczeń Policyjnych',
      'Centrum Badań Sądowo-Policyjnych',
    ],
    correctIndex: 0,
  },
  {
    question: 'Co oznacza skrót BOA?',
    answers: [
      'Biuro Ochrony Administracji',
      'Biuro Operacji Antyterrorystycznych',
      'Batalion Operacji Antykryzysowych',
      'Biuro Obserwacji i Analiz',
    ],
    correctIndex: 1,
  },
  {
    question: 'Co oznacza skrót SPKP?',
    answers: [
      'Sztab Policyjny Komendy Powiatowej',
      'Samodzielny Pododdział Kontrterrorystyczny Policji',
      'Specjalny Pluton Konwojowy Policji',
      'Sekcja Prewencji Kryminalnej Policji',
    ],
    correctIndex: 1,
  },
  {
    question: 'Co oznacza skrót WRD?',
    answers: [
      'Wydział Ruchu Drogowego',
      'Wydział Rejestracji Dokumentów',
      'Wydział Reagowania Dyżurnego',
      'Wydział Realizacji Dochodzeń',
    ],
    correctIndex: 0,
  },
  {
    question: 'Co oznacza skrót OPP?',
    answers: [
      'Oddział Patrolowo-Prewencyjny',
      'Oddział Prewencji Policji',
      'Oddział Pościgowy Policji',
      'Oddział Prawny Policji',
    ],
    correctIndex: 1,
  },
  {
    question: 'Co oznacza skrót BSWP?',
    answers: [
      'Biuro Spraw Wewnętrznych Policji',
      'Biuro Szkolenia i Wyszkolenia Policji',
      'Biuro Statystyki i Wywiadu Policyjnego',
      'Biuro Serwisowe Wyposażenia Policji',
    ],
    correctIndex: 0,
  },
  {
    question: 'Co oznacza skrót CSP?',
    answers: [
      'Centralny System Powiadamiania',
      'Centrum Szkolenia Policji',
      'Centrum Symulacji Policyjnych',
      'Centralna Sekcja Prewencji',
    ],
    correctIndex: 1,
  },
  {
    question: 'Co oznacza skrót KMP?',
    answers: ['Komenda Miejska Policji', 'Krajowy Monitoring Przestępczości', 'Komisariat Miejski Policji', 'Komenda Międzywojewódzka Policji'],
    correctIndex: 0,
  },
  {
    question: 'Co oznacza skrót KSP?',
    answers: ['Krajowa Sekcja Policyjna', 'Komenda Stołeczna Policji', 'Komisariat Specjalny Policji', 'Kolegium Szkolenia Policyjnego'],
    correctIndex: 1,
  },
  {
    question: 'Co oznacza skrót KGP?',
    answers: ['Komenda Główna Policji', 'Krajowa Grupa Prewencyjna', 'Komisariat Graniczny Policji', 'Kolegium Generałów Policji'],
    correctIndex: 0,
  },
  {
    question: 'Co oznacza skrót WK w strukturze Policji?',
    answers: ['Wydział Kadr', 'Wydział Konwojowy', 'Wydział Kryminalny', 'Wydział Komunikacji'],
    correctIndex: 2,
  },
  {
    question: 'Co oznacza skrót WKO?',
    answers: [
      'Wydział Konwojowo-Ochronny',
      'Wydział Kontroli Operacyjnej',
      'Wydział ds. Cudzoziemców',
      'Wydział Koordynacji Osobowej',
    ],
    correctIndex: 0,
  },
  {
    question: 'Która jednostka zajmuje się głównie zwalczaniem zorganizowanej przestępczości?',
    answers: ['WRD', 'CBŚP', 'CSP', 'Wydział Kontroli'],
    correctIndex: 1,
  },
  {
    question: 'Która jednostka odpowiada za działania kontrterrorystyczne i szturmowe?',
    answers: ['BOA', 'WRD', 'BSWP', 'Zespół Skarg i Wniosków'],
    correctIndex: 0,
  },
  {
    question: 'Który zespół zajmuje się nadzorem nad prawidłowością działania samych policjantów?',
    answers: ['Zespół dochodzeniowo-śledczy', 'BSWP', 'WRD', 'CSP'],
    correctIndex: 1,
  },
  {
    question: 'Który wydział odpowiada za szkolenie nowych funkcjonariuszy?',
    answers: ['CSP', 'WK', 'WKO', 'BOA'],
    correctIndex: 0,
  },
  {
    question: 'Która ranga jest wyższa: Aspirant czy Sierżant?',
    answers: ['Aspirant', 'Sierżant', 'To ta sama ranga', 'Zależy od stażu'],
    correctIndex: 0,
  },
  {
    question: 'Która ranga jest wyższa: Inspektor czy Podinspektor?',
    answers: ['Podinspektor', 'Inspektor', 'To ta sama ranga', 'Żadna, to różne korpusy'],
    correctIndex: 1,
  },
  {
    question: 'Która ranga jest wyższa: Nadkomisarz czy Komisarz?',
    answers: ['Komisarz', 'Nadkomisarz', 'To ta sama ranga', 'Nie da się porównać'],
    correctIndex: 1,
  },
  {
    question: 'Która ranga jest wyższa: Generalny Inspektor czy Nadinspektor?',
    answers: ['Nadinspektor', 'Generalny Inspektor', 'To ta sama ranga', 'Obie są równe Komendantowi'],
    correctIndex: 1,
  },
  {
    question: 'Jaka jest kolejność od najniższej do najwyższej: Sierżant, Aspirant, Podkomisarz?',
    answers: [
      'Sierżant → Aspirant → Podkomisarz',
      'Aspirant → Sierżant → Podkomisarz',
      'Podkomisarz → Sierżant → Aspirant',
      'Aspirant → Podkomisarz → Sierżant',
    ],
    correctIndex: 0,
  },
  {
    question: 'Który korpus jest najniższy w hierarchii Policji?',
    answers: ['Korpus Oficerów Młodszych', 'Korpus Szeregowych', 'Korpus Aspirantów', 'Korpus Generałów'],
    correctIndex: 1,
  },
  {
    question: 'Kto stoi na czele Komendy Stołecznej Policji?',
    answers: ['Generalny Inspektor', 'Komendant Stołeczny Policji', 'Nadinspektor Wydziału Kontroli', 'Aspirant Sztabowy'],
    correctIndex: 1,
  },
  {
    question: 'Ile maksymalnie godzin można zatrzymać osobę bez decyzji sądu (zgodnie z ogólną zasadą)?',
    answers: ['24 godziny', '48 godzin', '72 godziny', '12 godzin'],
    correctIndex: 1,
  },
  {
    question: 'Jak nazywa się pierwsza czynność, którą policjant wykonuje wobec kontrolowanej osoby?',
    answers: ['Rewizja osobista', 'Legitymowanie', 'Zatrzymanie', 'Przesłuchanie'],
    correctIndex: 1,
  },
  {
    question: 'Co powinien zrobić policjant PRZED użyciem broni palnej wobec osoby (poza sytuacją bezpośredniego zagrożenia życia)?',
    answers: [
      'Od razu oddać strzał ostrzegawczy',
      'Wezwać do zachowania zgodnego z prawem i uprzedzić o użyciu broni',
      'Wezwać najbliższy patrol i czekać',
      'Nic, użycie broni nie wymaga zapowiedzi',
    ],
    correctIndex: 1,
  },
  {
    question: 'Jak nazywa się dokument uprawniający do prowadzenia pojazdu uprzywilejowanego (na sygnałach)?',
    answers: [
      'Prawo jazdy kategorii B+E',
      'Zaświadczenie o ukończeniu kursu kierowcy pojazdu uprzywilejowanego',
      'Legitymacja służbowa',
      'Karta kwalifikacji kierowcy',
    ],
    correctIndex: 1,
  },
  {
    question: 'Który zespół w ramach Wydziału Kryminalnego zajmuje się przestępczością narkotykową?',
    answers: [
      'Zespół dochodzeniowo-śledczy',
      'Sekcja do walki z przestępczością narkotykową',
      'Zespół do walki z handlem ludźmi',
      'Nieetatowa Grupa Realizacyjna',
    ],
    correctIndex: 1,
  },
  {
    question: 'Do czego służy Nieetatowa Grupa Realizacyjna?',
    answers: [
      'Do obsługi kancelaryjnej wydziału',
      'Do przeprowadzania realizacji (zatrzymań) w sprawach kryminalnych',
      'Do szkolenia nowych aspirantów',
      'Do kontroli finansowej jednostki',
    ],
    correctIndex: 1,
  },
  {
    question: 'Jaki jest główny cel Zespołu Skarg i Wniosków?',
    answers: [
      'Prowadzenie pościgów drogowych',
      'Rozpatrywanie skarg obywateli na działania funkcjonariuszy',
      'Nadzór nad amunicją i uzbrojeniem',
      'Rekrutacja nowych funkcjonariuszy',
    ],
    correctIndex: 1,
  },
  {
    question: 'Kto może przydzielić lub odebrać przynależność do CBŚP w strukturze bota?',
    answers: [
      'Każdy posiadacz roli Policja',
      'Komendant albo administracja (Zarządzaj Serwerem)',
      'Sam zainteresowany funkcjonariusz',
      'CBŚP nie jest nikomu przydzielane',
    ],
    correctIndex: 1,
  },
  {
    question: 'Ile aktywnych punktów karnych powoduje automatyczne zawieszenie prawa jazdy w tym systemie?',
    answers: ['12', '18', '24', '30'],
    correctIndex: 2,
  },
  {
    question: 'Po jakim czasie wygasają punkty karne w tym systemie?',
    answers: ['Po dobie', 'Po tygodniu', 'Po miesiącu', 'Nigdy nie wygasają'],
    correctIndex: 1,
  },
];

module.exports = { POLICE_EXAM_QUESTIONS };
