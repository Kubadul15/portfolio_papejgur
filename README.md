# Emergency Hamburg RP — Bot Discord (Gdańsk RP)

Bot Discord do obsługi paneli weryfikacyjnych serwera oraz systemu policyjnego RP. Aktualnie dostępne panele:

- **`/panel stworz-dowod [ranga:@rola]`** — publikuje embed z przyciskiem **"Stwórz Dowód"**. Po kliknięciu
  gracz wypełnia formularz (imię i nazwisko RP, wiek RP, obywatelstwo RP, nick Roblox). **Wiek musi być
  liczbą całkowitą 1–100** — inaczej bot odrzuci formularz z prośbą o poprawę. Bot weryfikuje nick w
  publicznym API Roblox (prawdziwy avatar + nazwa konta) i pokazuje graczowi prywatny (widoczny tylko dla
  niego) podgląd dowodu z przyciskami **Wyślij** / **Anuluj**. Po kliknięciu "Wyślij" gotowy dowód trafia na
  skonfigurowany kanał docelowy. Jeśli podasz opcjonalny parametr `ranga` (np. "Obywatel"), bot
  **automatycznie nada tę rolę** po wysłaniu dowodu — można ją potem wymagać w innych panelach (patrz niżej).

- **`/panel weryfikacja ranga:@rola`** — publikuje embed z przyciskiem **"Zweryfikuj się"**, który korzysta
  z dokładnie tego samego mechanizmu co `stworz-dowod`: gracz wypełnia formularz (imię i nazwisko RP, wiek
  RP, obywatelstwo RP, nick Roblox), bot weryfikuje nick w publicznym API Roblox i pokazuje prywatny podgląd
  dowodu z przyciskami **Wyślij** / **Anuluj**. Po kliknięciu "Wyślij" dowód trafia na ten sam kanał docelowy
  co wszystkie inne dowody, a gracz **automatycznie otrzymuje podaną rolę** (np. "Zweryfikowany"). Nie ma tu
  już starego mechanizmu z kodem wklejanym do opisu profilu Roblox — rola wymaga tylko poprawnego dowodu.

- **`/panel prawojazdy kanal:#kanał [ranga:@rola] [wymagana-ranga:@rola]`** — publikuje embed z przyciskiem
  **"Podejdź do egzaminu"**. Jeśli podasz `wymagana-ranga` (np. rolę "Obywatel" nadawaną przez
  `stworz-dowod`), przycisk **zadziała tylko dla osób posiadających tę rolę** — bez niej bot od razu
  odpowie błędem, więc **nie da się podejść do egzaminu bez dowodu**. Po przejściu bramki gracz wybiera z
  listy **kategorię prawa jazdy** (pełna lista jak w polskim systemie: AM, A1, A2, A, B1, B, B+E, C1, C1+E,
  C, C+E, D1, D1+E, D, D+E, T — każda ze swoim minimalnym wiekiem, np. B od 18 lat, AM od 14 lat —
  `src/data/licenseCategories.js`), potem wypełnia formularz zgłoszeniowy (imię i nazwisko RP, wiek RP,
  nick Roblox — weryfikowany tak samo jak w dowodzie). **Wiek musi być liczbą 1–100, a dodatkowo musi
  spełniać minimum wiekowe wybranej kategorii** — jeśli nie spełnia, bot odrzuca zgłoszenie z jasnym
  komunikatem i egzamin się nie zaczyna. Dopiero wtedy, tak jak na prawdziwym egzaminie, gracz odpowiada po
  kolei na 6 losowo wybranych pytań teoretycznych (z puli ~20 w `src/data/examQuestions.js` — inny zestaw za
  każdym podejściem) z 4 odpowiedziami do wyboru. Dopuszczalna jest tylko jedna pomyłka — po zdanym
  egzaminie pojawia się karta **Prawo Jazdy RP** (bardzo podobna do Dowodu Osobistego RP) z wybraną
  kategorią, numerem i wynikiem, którą gracz wysyła przyciskiem **Wyślij** na wskazany przy tworzeniu panelu
  kanał. Jeśli podasz opcjonalny parametr `ranga`, bot **automatycznie nada tę rolę** po zdanym egzaminie
  (np. rolę "Kierowca", wymaganą potem przez panel rejestracji pojazdu — patrz niżej). Po oblanym egzaminie
  obowiązuje 15-minutowy cooldown, zanim będzie można podejść ponownie. Cały przebieg egzaminu (obie role,
  kategoria, wylosowana kolejność pytań, wynik, kanał docelowy) jest zakodowany w przyciskach i treści
  wiadomości, więc też przetrwa restart bota.

- **`/panel pojazd kanal:#kanał wymagana-ranga:@rola`** — publikuje embed z przyciskiem **"Zarejestruj
  pojazd"**. Klik działa **tylko** dla graczy posiadających `wymagana-ranga` (np. rolę "Kierowca" nadawaną
  automatycznie po zdaniu prawa jazdy — patrz wyżej); bez niej bot odpowie błędem i nic więcej się nie
  wydarzy. Jeśli rola się zgadza, gracz wybiera z listy **typ/kategorię pojazdu** (ta sama lista co przy
  prawie jazdy), a potem wypełnia formularz: marka i model, rok produkcji, kolor, silnik/pojemność,
  właściciel (imię i nazwisko RP). **Rok produkcji musi być prawidłową czterocyfrową liczbą** (1900 do
  przyszłego roku) — inaczej bot odrzuci formularz. Ponieważ Discord ogranicza modal do 5 pól (i nie
  pozwala pokazać drugiego modala w odpowiedzi na pierwszy), **numer rejestracyjny gracz podaje sam w
  drugim okienku, otwieranym przyciskiem "Podaj numer rejestracyjny"** zaraz po pierwszym formularzu — musi
  być unikalny (bot sprawdza w rejestrze i odrzuci numer już zajęty przez inny pojazd) i może zawierać
  tylko litery, cyfry, spacje i myślniki (3–12 znaków). Bot automatycznie generuje jeszcze 17-znakowy
  **numer VIN**, datę rejestracji oraz roczną
  ważność przeglądu i OC — wszystko trafia na kartę **Dowód Rejestracyjny Pojazdu RP**, którą gracz wysyła
  przyciskiem **Wyślij** na skonfigurowany kanał.

- **`/panel tickety kanal:#kanał kategoria:<kategoria> rola-obslugi:@rola`** — publikuje embed z
  przyciskiem **"Stwórz Ticket"**. Klik → jeśli gracz ma już otwarty ticket, bot odmawia i wskazuje
  istniejący kanał (**jeden aktywny ticket na osobę**). W przeciwnym razie pokazuje modal z tematem/powodem,
  po czym tworzy prywatny kanał tekstowy w podanej `kategoria` — widoczny tylko dla twórcy i roli
  `rola-obslugi`. W kanale ticketu pojawia się embed z przyciskami:
  - **Przyjmij** — dowolny członek `rola-obslugi` może przyjąć zgłoszenie; po przyjęciu **reszta obsługi
    traci widoczność tego kanału** — zostaje tylko twórca i osoba, która przyjęła.
  - **Dodaj osobę** — obsługa może przez wybór z listy dorzucić dodatkową osobę do rozmowy (np. świadka).
  - **Zamknij** — dostępne dla twórcy i obsługi. Jeśli ustawiono `ADMIN_LOG_CHANNEL_ID`, bot wysyła tam
    **transkrypt** (do 100 ostatnich wiadomości jako plik `.txt`) razem z metadanymi (kto stworzył, kto
    przyjął, kto zamknął), a następnie usuwa kanał.

  Cały stan ticketu (właściciel, rola obsługi, kto przyjął) jest zapisany w **temacie kanału ticketu** —
  zero bazy danych, przetrwa restart bota.

- **`/panel rekrutacja kanal:#kanał kategoria:<kategoria> rola-obslugi:@rola [ranga-po-akceptacji:@rola]`**
  — publikuje embed z przyciskiem **"📝 Napisz podanie"**. Klik → blokada, jeśli kandydat ma już otwarte
  podanie albo jest na 24-godzinnym cooldownie po niedawnym odrzuceniu. Najpierw select menu "Czy posiadasz
  sprawny mikrofon?", potem modal z pytaniami: ile masz lat, czy byłeś na innych serwerach (i na jakich),
  ile grasz w Emergency Hamburg, skąd poznałeś serwer, ile masz godzin na naszym serwerze. Bot tworzy
  prywatny kanał-podanie w `kategoria` (widoczny dla kandydata i `rola-obslugi`) z embedem zawierającym
  odpowiedzi **plus automatycznie datę założenia konta Discord i datę dołączenia na serwer** — łatwo
  zauważyć świeże konto zgłaszające się od razu. Obsługa rozpatruje przez **select menu**:
  - **✅ Przyjmij** — nadaje `ranga-po-akceptacji` (jeśli podana), wysyła kandydatowi DM z gratulacjami,
    zamyka kanał.
  - **❌ Odrzuć** — pyta o powód (opcjonalnie), wysyła DM z powodem, ustawia **24h cooldown** na ponowne
    podanie, zamyka kanał.
  - **📞 Wezwij użytkownika** — wysyła kandydatowi DM z prośbą o kontakt/powrót na kanał; kanał zostaje
    otwarty.
  - **👀 W trakcie rozpatrywania** — oznacza w embedzie, kto się już tym zajmuje, żeby obsługa nie
    dublowała pracy; kanał zostaje otwarty.

  Tak jak w tickecie, cały stan (właściciel, obie role, status) jest w temacie kanału — zero bazy danych.

- **`/panel mafia kanal:#kanał`** — publikuje embed z przyciskiem **"🔫 Stwórz Organizację"** w bieżącym
  kanale. Klik → select menu "Ile osób jest w organizacji?" (opcje 3–10 oraz "10+", więc minimum 3 osoby
  jest wymuszone samą listą wyboru, bez możliwości ominięcia), potem modal: Właściciel Mafii/Gangu,
  Współwłaściciel Mafii/Gangu, Nazwa Mafii/Gangu, Kolor Aut, **Miejscówka (gdzie jest baza)**. Bot pokazuje
  prywatny podgląd karty organizacji (z automatycznie wygenerowanym numerem, np. `MG-4821`) z przyciskami
  **Wyślij** / **Anuluj**. Po kliknięciu "Wyślij" karta trafia na skonfigurowany kanał `kanal`, a jeśli
  ustawiony jest system policyjny, miejscówka pojawia się też w `/policja sprawdz-gracza`.

## System Policyjny (`/policja`)

W odróżnieniu od `/panel` (który tylko **publikuje** panele dla graczy), `/policja` to zestaw komend
**akcji** wykonywanych przez funkcjonariuszy — dlatego żyje jako osobna komenda z własnymi podkomendami
(nadal jedna komenda, `nie osobne komendy` na każdą funkcję):

**Ograniczenie do jednego serwera:** bota można zaprosić na więcej niż jeden serwer Discord (`GUILD_ID`
przyjmuje listę ID rozdzieloną przecinkami — patrz sekcja "Wdrożenie na Railway" niżej, komendy rejestrują
się osobno na każdym z nich), ale cały `/policja` (wszystkie podkomendy, łącznie z `rekrutacja`) **działa
wyłącznie na jednym, skonfigurowanym serwerze** — na każdym innym serwerze bot grzecznie odmówi wykonania
komendy. Ten jeden serwer ustawia się osobną zmienną `POLICE_GUILD_ID` (domyślnie już ustawiona na główny
serwer Gdańsk RP). `/panel` nie ma tego ograniczenia — działa normalnie na każdym serwerze wymienionym w
`GUILD_ID`. **Ten serwer policyjny jest zawsze automatycznie dopisywany do listy rejestracji komend**,
nawet jeśli zapomnisz go dodać w `GUILD_ID` na Railway — nie trzeba go tam osobno wpisywać.

- **`/policja rekrutacja kanal:#kanał kategoria:<kategoria> rola-obslugi:@rola [ranga-po-akceptacji:@rola]`**
  — panel naboru do **Komendy Miejskiej Policji (KMP)**. Zanim kandydat w ogóle zobaczy formularz podania,
  musi najpierw zdać **egzamin wiedzy** — 10 losowych, trudnych pytań z puli ~33 (skróty jednostek: CBŚP,
  BOA, SPKP, WRD, OPP, BSWP, CSP, KMP, KSP, KGP..., hierarchia stopni, procedury RP) z dopuszczalną tylko
  **jedną pomyłką**. Dopiero po zdanym egzaminie pojawia się przycisk **Złóż podanie**, który uruchamia
  dokładnie ten sam formularz co `/panel rekrutacja` (mikrofon, dane, kanał-podanie, przyjęcie/odrzucenie
  przez select menu). Po oblanym egzaminie obowiązuje **godzinny cooldown** (surowszy niż przy prawie
  jazdy) zanim można podejść ponownie.
- **`/policja rekrutacja-wrd kanal:#kanał kategoria:<kategoria> rola-obslugi:@rola [ranga-po-akceptacji:@rola]`**
  — osobny, lżejszy panel naboru do **Wydziału Ruchu Drogowego (WRD)** w ramach KMP. Zamiast trudnego
  egzaminu do KMP, kandydat zdaje **egzamin podstawowy** — 8 pytań z puli 16, skupionych na ruchu drogowym
  (ograniczenia prędkości, kontrola drogowa, sygnalizacja, różnica kolizja/wypadek), z dopuszczalnymi
  **dwiema pomyłkami** i krótszym, 20-minutowym cooldownem po oblaniu. Poza tym działa identycznie —
  po zdaniu ten sam formularz podania co w pozostałych rekrutacjach.
- **`/policja setup`** *(wymaga uprawnienia Zarządzanie serwerem)* — konfiguruje rolę dostępu `@Policja`
  oraz całą **drabinkę awansów** — 21 rang na wzór struktury Komendy Stołecznej Policji: Aplikant →
  Posterunkowy → Starszy Posterunkowy → Sierżant → Starszy Sierżant → Sierżant Sztabowy → Młodszy Aspirant
  → Aspirant → Starszy Aspirant → Aspirant Sztabowy → Podkomisarz → Komisarz → Nadkomisarz → Podinspektor →
  Młodszy Inspektor → Inspektor → Nadinspektor → Generalny Inspektor → Asystent/Zastępca/Komendant
  Stołeczny Policji — plus opcjonalną rolę specjalnej jednostki **CBŚP** (przydzielaną osobno, poza
  drabinką). **Wszystkie rangi są opcjonalne i można je uzupełniać stopniowo** — `/policja setup` można
  uruchomić wielokrotnie, każde kolejne wywołanie dopisuje tylko podane role, nie kasując już
  skonfigurowanych (przydatne, bo wypełnienie 21 ról na raz w jednym poleceniu Discorda jest niewygodne).
- **`/policja sprawdz-gracza nick:<nick_roblox>`** *(wymaga roli `@Policja`, odpowiedź widoczna dla
  wszystkich na kanale)* — pełny profil gracza po nicku Roblox: dane z dowodu, posiadane kategorie prawa
  jazdy (+ status zawieszenia), zarejestrowane pojazdy, rejestr karny (liczba, suma mandatów, ostatnie 3 z
  punktami karnymi), **aktualne punkty karne (x/24)**, status na liście gończej, a jeśli sam jest
  funkcjonariuszem — jego rangę i przynależność do CBŚP.
- **`/policja sprawdz-auto rejestracja:<numer_rejestracyjny>`** *(rola `@Policja`)* — odwrotność
  `sprawdz-gracza`: podajesz numer rejestracyjny pojazdu (np. z kontroli drogowej), a bot przeszukuje
  wszystkie zarejestrowane pojazdy w bazie i pokazuje pełne dane auta oraz **do kogo (jakiego konta
  Discord) należy** — bez potrzeby znajomości nicku Roblox właściciela.
- **`/policja mandat gracz:@osoba kwota:<zł> punkty:<1-15> powod:<opis>`** *(rola `@Policja`)* — wystawia
  mandat z **punktami karnymi jak w prawdziwym systemie**: punkty się sumują i **wygasają tydzień po
  wystawieniu mandatu** (skrócone z realnego roku na potrzeby tempa RP), a po przekroczeniu **24 aktywnych
  punktów prawo jazdy jest automatycznie zawieszane**. Cały mandat trafia do rejestru karnego gracza i jest
  widoczny w `sprawdz-gracza`.
- **`/policja goniony gracz:@osoba akcja:<Dodaj/Usuń> [powod]`** *(rola `@Policja`)* — ogłasza lub zdejmuje
  list gończy (np. po zatrzymaniu); status widoczny w `sprawdz-gracza`.
- **`/policja zawieszenie gracz:@osoba akcja:<Zawieś/Przywróć> [powod]`** *(rola `@Policja`)* — blokuje albo
  przywraca uprawnienia do prowadzenia pojazdów po poważnym wykroczeniu; `sprawdz-gracza` pokazuje wyraźny
  status "ZAWIESZONE".
- **`/policja sluzba`** *(rola `@Policja`, odpowiedź widoczna dla wszystkich na kanale)* — dziennik służby
  (clock-in/out) dla wywołującego: pierwsze użycie rozpoczyna służbę, drugie ją kończy i dolicza
  przepracowany czas do statystyk.
- **`/policja ranking`** — publiczny ranking aktywności służbowej (suma godzin, kto aktualnie pełni służbę).
- **`/policja awans gracz:@osoba`** / **`/policja degradacja gracz:@osoba`** *(Zarządzanie serwerem albo
  ranga Komendanta)* — przesuwa funkcjonariusza o jeden szczebel w górę/dół drabinki, automatycznie
  zdejmując starą i nadając nową rolę rangi.
- **`/policja cbsp gracz:@osoba akcja:<Dodaj/Usuń>`** *(Zarządzanie serwerem albo ranga Komendanta)* —
  przydziela lub odbiera przynależność do CBŚP, niezależnie od rangi na drabince.

### Trwały rejestr danych (wymaga Railway Volume!)

Wszystkie panele (`stworz-dowod`, `weryfikacja`, `prawojazdy`, `pojazd`, `mafia`) oraz cały system
policyjny (mandaty, punkty karne, lista gończa, zawieszenia, rangi, CBŚP, dziennik służby) automatycznie
zapisują dane do jednego pliku JSON (`src/utils/registry.js`), żeby `/policja sprawdz-gracza` mogło je
odnaleźć po nicku Roblox. **To już działa samo z siebie** — problem w tym, że Railway domyślnie ma
**efemeryczny dysk: cały plik znika przy każdym redeployu** (czyli przy każdym `git push` na `main`, bo to
właśnie wtedy Railway stawia świeży kontener), jeśli nie podepniesz trwałego wolumenu:

1. W projekcie na Railway: zakładka **Volumes** → **New Volume**.
2. Ustaw **Mount Path**, np. `/data`.
3. W zakładce **Variables** dodaj `REGISTRY_PATH=/data/registry.json` (musi wskazywać na plik **wewnątrz**
   zamontowanego wolumenu — sama zmienna bez wolumenu nic nie da).
4. Redeployuj — od teraz rejestr przetrwa restarty i kolejne deploye.

**Jak sprawdzić, czy to faktycznie działa:** po starcie bota w logach (Railway → Deployments → View Logs)
pojawia się linijka `Rejestr danych: <ścieżka> (plik ISTNIEJE / NIE istnieje...)`. Jeśli po kilku
redeployach ciągle widzisz "NIE istnieje", to `REGISTRY_PATH` nie wskazuje faktycznie na zamontowany
wolumen (albo wolumen w ogóle nie jest podpięty) — dane bez tego **zawsze** będą się zerować, niezależnie
od tego, czy trzymane są w JSON czy YAML — to ograniczenie hostingu, a nie formatu pliku.

Bez tego kroku bot nadal działa normalnie (wszystkie panele i komendy `/policja` też), ale rejestr
resetuje się przy każdym redeployu z Railwaya.

### Realistyczny łańcuch wymagań

Panele można spiąć w logiczny ciąg zależności, tak żeby nie dało się "przeskoczyć" etapów:

```
/panel stworz-dowod ranga:@Obywatel
        ↓ (po wysłaniu dowodu automatycznie: rola @Obywatel)
/panel prawojazdy kanal:#prawo-jazdy ranga:@Kierowca wymagana-ranga:@Obywatel
        ↓ (po zdanym egzaminie automatycznie: rola @Kierowca)
/panel pojazd kanal:#pojazdy wymagana-ranga:@Kierowca
```

Wszystkie role są opcjonalne — jeśli ich nie podasz przy tworzeniu panelu, odpowiednia bramka/nadawanie po
prostu nie działa dla tego konkretnego panelu (zachowanie sprzed tej zmiany). Panele utworzone przed
dodaniem tych parametrów nadal działają bez zmian (kompatybilność wsteczna).

**Ograniczenie:** bot nie ma bazy danych, więc nie porównuje automatycznie imienia i nazwiska podanego w
dowodzie z tym podanym później w prawie jazdy — każdy formularz to osobny, niezależny wpis. Wymóg posiadania
roli z dowodu eliminuje próby ominięcia całego procesu, ale nie wymusza identycznej pisowni danych między
panelami. Włącz `ADMIN_LOG_CHANNEL_ID` (patrz niżej), żeby administracja mogła łatwo porównać zgłoszone dane
i ręcznie zareagować na niespójności.

Kolejne panele (np. `/panel ...`) można dopisywać jako kolejne subkomendy w `src/commands/panel.js`.

Opcjonalnie: jeśli ustawisz zmienną `ADMIN_LOG_CHANNEL_ID`, bot będzie wysyłał na ten kanał log każdego
wysłanego dowodu, udanej weryfikacji Roblox oraz wyniku (zdany/niezdany) egzaminu na prawo jazdy — razem z
tym, kto i kiedy to zrobił. Bez tej zmiennej logowanie jest po prostu pomijane.

## Ban na Robloxie (`/robloxban`)

**`/robloxban nick:<nick_roblox> czas:<liczba_dni_lub_perm> powod:<opis>`** *(wymaga uprawnienia Discorda
Blokuj użytkowników)* — wystawia ban na podany nick Roblox i publikuje kartę bana na stałym kanale logów
(`ROBLOX_BAN_CHANNEL_ID`, domyślnie już ustawiony). Bot próbuje zweryfikować nick w publicznym API Roblox
(prawdziwy avatar i link do profilu) — jeśli konto nie istnieje, karta i tak zostanie wysłana z wyraźnym
ostrzeżeniem. W polu `czas` podaj liczbę dni (np. `7`) albo słowo `perm` dla bana permanentnego.

**Odwrotne ograniczenie serwera niż `/policja`:** ta komenda działa wyłącznie na "starym" serwerze — tym,
na którym bot był, zanim doszedł drugi, policyjny serwer. Serwer ten ustawia się zmienną `LEGACY_GUILD_ID`
(domyślnie już skonfigurowana). Na każdym innym serwerze (w tym na serwerze policyjnym) komenda grzecznie
odmówi działania — dokładnie tak samo jak `/policja` odmawia działania poza swoim serwerem, tylko
odwrotnie.

## Sesje RP (`/roleplay`)

- **`/roleplay start`** — rozpoczyna nową sesję RP na serwerze: publikuje embed z **stałym kodem sesji**
  (domyślnie `pt9iqi8i`, ten sam za każdym razem — można nadpisać zmienną `ROLEPLAY_SESSION_CODE`) oraz
  informacją, kto sesję rozpoczął (osoba, która użyła komendy). Jeśli sesja już trwa, komenda odmawia i
  przypomina, kto ją rozpoczął.
- **`/roleplay stop`** — kończy aktualnie trwającą sesję: pokazuje kod sesji, kto ją rozpoczął, kto ją
  zakończył (może to być inna osoba niż ta, która startowała) oraz jak długo trwała.

Sesja jest jedna, globalna dla całego serwera (nie per-gracz) i przetrwa restart bota — stan trzymany jest
w tym samym trwałym rejestrze co reszta danych (patrz sekcja "Trwały rejestr danych" wyżej).

## Wymagania

- Node.js 20+
- Konto Discord Developer (aplikacja + bot)
- Konto na https://railway.app (hosting 24/7, połączony z tym repo na GitHubie)

## 1. Utworzenie bota w Discord Developer Portal

1. Wejdź na https://discord.com/developers/applications → **New Application**.
2. W zakładce **Bot** kliknij **Reset Token** i skopiuj token (to `DISCORD_TOKEN`).
3. W zakładce **General Information** skopiuj **Application ID** (to `CLIENT_ID`).
4. W zakładce **Bot** włącz **Privileged Gateway Intents → MESSAGE CONTENT INTENT** (jeden przełącznik,
   bez weryfikacji dla botów na mniej niż 100 serwerach) — potrzebne do transkryptów zamykanych ticketów.
5. W zakładce **OAuth2 → URL Generator** zaznacz scope `bot` oraz `applications.commands`,
   z uprawnień zaznacz co najmniej: *Send Messages*, *Embed Links*, *Use Slash Commands*, *Manage Roles*
   (nadawanie ról), *Manage Channels* (tworzenie/usuwanie kanałów ticketów).
   Wygenerowanym linkiem zaproś bota na serwer Gdańsk RP — **i na każdy kolejny serwer, na którym ma
   działać** (tym samym linkiem, tylko wybierz inny serwer w oknie zaproszenia).
6. Włącz Developer Mode w Discordzie (Ustawienia → Zaawansowane), kliknij PPM na serwer →
   **Kopiuj ID serwera** (to `GUILD_ID` — jeśli bot ma działać na kilku serwerach, zbierz ID każdego z nich
   i połącz przecinkami, np. `GUILD_ID=1111111111,2222222222`), oraz PPM na kanał docelowy dowodów →
   **Kopiuj ID kanału** (to `TARGET_CHANNEL_ID`).

## 2. Wdrożenie na Railway (hosting 24/7)

1. Załóż konto na https://railway.app (najprościej: zaloguj się przez GitHub).
2. **New Project → Deploy from GitHub repo** → wybierz to repozytorium i branch `main`.
3. Railway samo wykryje aplikację Node.js (Nixpacks), zainstaluje zależności i uruchomi `npm start`.
4. W zakładce **Variables** projektu dodaj zmienne środowiskowe (te same nazwy co w `.env.example`):

   | Zmienna | Opis |
   |---|---|
   | `DISCORD_TOKEN` | token bota |
   | `CLIENT_ID` | Application ID |
   | `GUILD_ID` | ID serwera Gdańsk RP (lub kilka ID po przecinku, jeśli bot ma działać na kilku serwerach) |
   | `TARGET_CHANNEL_ID` | ID kanału, na który trafiają zatwierdzone dowody |
   | `ID_PREFIX` | np. `EH` — prefiks numeru dowodu |
   | `SERVER_NAME` | np. `Emergency Hamburg ROLEPLAY \| Gdańsk RP` |
   | `EMBED_COLOR` | np. `#8b5cf6` |
   | `ADMIN_LOG_CHANNEL_ID` | opcjonalnie — ID kanału logów administracyjnych |
   | `REGISTRY_PATH` | opcjonalnie — ścieżka trwałego rejestru; ustaw dopiero po podpięciu Volume (patrz sekcja "System Policyjny" niżej) |
   | `POLICE_GUILD_ID` | opcjonalnie — ID serwera, na którym ma działać `/policja`; domyślnie już ustawione na główny serwer |
   | `LEGACY_GUILD_ID` | opcjonalnie — ID "starego" serwera, na którym ma działać `/robloxban`; domyślnie już ustawione |
   | `ROBLOX_BAN_CHANNEL_ID` | opcjonalnie — ID kanału logów banów dla `/robloxban`; domyślnie już ustawione |

5. Po zapisaniu zmiennych Railway zbuduje i uruchomi bota. `npm start` najpierw rejestruje/aktualizuje
   komendy slash (`node src/deploy-commands.js`), a potem startuje bota (`node src/index.js`) —
   wszystko dzieje się automatycznie przy każdym deployu.
6. Od tej pory każdy `git push` na `main` automatycznie redeployuje bota na Railway — bez żadnej
   dodatkowej konfiguracji po Twojej stronie.

**Koszt:** Railway nie jest już bezterminowo darmowy — nowe konta dostają jednorazowy kredyt
próbny, a dalej działa na płatnym planie Hobby rozliczanym za realne zużycie (dla małego bota
działającego 24/7 to zwykle niewielka kwota miesięcznie). W zamian dostajesz w pełni zarządzany,
prawdziwy hosting 24/7 bez potrzeby trzymania własnego komputera włączonego.

### Logi i restart na Railway

W dashboardzie projektu: zakładka **Deployments** → wybierz aktywny deployment → **View Logs**
(podgląd logów na żywo). Restart bota: przycisk **Restart** przy deploymencie, redeploy najnowszej
wersji: **Redeploy**.

## Uruchomienie lokalne (do testów)

```bash
npm install
cp .env.example .env   # uzupełnij wartości
npm run deploy-commands
npm start
```

## Szybki test w GitHub Codespaces (nie 24/7!)

Codespaces to wygodny sposób, żeby **przetestować** bota bez instalowania czegokolwiek lokalnie —
**ale to nie jest hosting 24/7**. Codespace usypia po okresie bezczynności, a darmowe konto ma
ograniczony miesięczny limit godzin (przy ciągłym działaniu 24/7 szybko go przekroczysz i zaczniesz
płacić). Do stałego działania bota służy Railway opisany w sekcji 2 powyżej.

1. Ustaw sekrety na poziomie Codespaces: **Settings → Secrets and variables → Codespaces →
   New repository secret**, dodaj te same wartości co w tabeli z sekcji 2 (`DISCORD_TOKEN`,
   `CLIENT_ID`, `GUILD_ID`, `TARGET_CHANNEL_ID`, `ID_PREFIX`, `SERVER_NAME`, `EMBED_COLOR`).
   GitHub wstrzyknie je automatycznie jako zmienne środowiskowe w Codespace (`.devcontainer/devcontainer.json`
   przekazuje je dalej do kontenera) — nie trzeba ręcznie tworzyć pliku `.env`.
2. **Code → Codespaces → Create codespace on main** — zależności (`npm install`) zainstalują się
   automatycznie po starcie.
3. W terminalu Codespace uruchom:
   ```bash
   npm run deploy-commands
   npm start
   ```
4. Bot będzie działał tak długo, jak długo Codespace jest uruchomiony/aktywny. Po jego zatrzymaniu
   (bezczynność, zamknięcie karty, limit godzin) bot przestanie odpowiadać — to normalne przy tym
   trybie i nie jest błędem.

## Uprawnienia

Komenda `/panel` wymaga uprawnienia **Zarządzanie serwerem** — widzą i mogą jej użyć tylko
administratorzy/staff, żeby zwykli gracze nie mogli tworzyć własnych paneli.

Dla `/panel weryfikacja` (oraz opcjonalnych ról w `stworz-dowod`/`prawojazdy`) bot dodatkowo musi mieć
uprawnienie **Zarządzaj rolami**, a jego własna rola (najwyższa rola bota na liście ról serwera) musi być
**wyżej** niż rola nadawana graczom — inaczej Discord nie pozwoli botowi jej przyznać.

Dla `/panel tickety` bot musi mieć uprawnienie **Zarządzaj kanałami** (tworzenie/usuwanie kanałów
ticketów i edycja ich uprawnień) oraz włączony **Message Content Intent** (patrz krok 4 w sekcji 1) —
bez niego transkrypt przy zamknięciu ticketu będzie pusty.

Komenda `/policja` nie ma globalnego ograniczenia uprawnień (żeby zwykli funkcjonariusze mogli używać
`sprawdz-gracza`/`mandat`/`sluzba`) — dostęp jest sprawdzany w kodzie na podstawie roli `@Policja`
skonfigurowanej przez `/policja setup`. Podkomendy `setup`, `awans`, `degradacja` i `cbsp` dodatkowo
wymagają uprawnienia **Zarządzanie serwerem** albo posiadania rangi **Komendanta**. Do zmiany rang i CBŚP
bot musi mieć uprawnienie **Zarządzaj rolami**, a jego rola musi być **wyżej** niż wszystkie role rang i
rola CBŚP na liście ról serwera.
