# Emergency Hamburg RP — Bot Discord (Małopolska RP)

Bot Discord do obsługi paneli weryfikacyjnych serwera. Aktualnie dostępne panele:

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

- **`/panel pojazd kanal:#kanał wymagana-ranga:@rola`** — publikuje embed z przyciskiem **"Zarejestruj
  pojazd"**. Klik działa **tylko** dla graczy posiadających `wymagana-ranga` (dowolna rola wskazana przy
  tworzeniu panelu, np. nadawana przez `stworz-dowod`/`weryfikacja`); bez niej bot odpowie błędem i nic
  więcej się nie wydarzy. Jeśli rola się zgadza, gracz wybiera z listy **typ/kategorię pojazdu**
  (`src/data/licenseCategories.js`), a potem wypełnia formularz: marka i model, rok produkcji, kolor, silnik/pojemność,
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
  **Wyślij** / **Anuluj**. Po kliknięciu "Wyślij" karta trafia na skonfigurowany kanał `kanal`.

- **`/panel zaloz-dom kanal:#kanał`** — publikuje embed z przyciskiem **"🏠 Załóż Dom"**. Klik → select menu
  z **typem nieruchomości** (Kawalerka, Mieszkanie, Szeregowiec, Dom Jednorodzinny, Willa, Rezydencja,
  Penthouse — `src/data/houseCategories.js`), potem pierwszy modal: właściciel, **lokalizacja**
  (dzielnica/okolica), adres, cena, liczba pokoi. Ponieważ Discord ogranicza modal do 5 pól (i nie pozwala
  pokazać drugiego modala w odpowiedzi na pierwszy), **dodatkowe szczegóły gracz podaje w drugim okienku**,
  otwieranym przyciskiem "Podaj dodatkowe szczegóły": powierzchnia (m²), rok budowy, garaż (tak/nie), basen
  (tak/nie), opis/udogodnienia. Cena, liczba pokoi, powierzchnia i rok budowy są walidowane (samo liczby w
  sensownym zakresie), a garaż/basen muszą być "tak" albo "nie" — inaczej bot poprosi o poprawę. Bot
  generuje unikalny numer aktu (np. `DOM-4821`) i pokazuje prywatny podgląd **Aktu Własności Domu RP** z
  przyciskami **Wyślij** / **Anuluj**; po "Wyślij" akt trafia na skonfigurowany kanał `kanal`.

- **`/panel aukcja-domow kanal:#kanał`** — publikuje embed z przyciskiem **"🏛️ Rozpocznij aukcję"**.
  W odróżnieniu od pozostałych paneli, ten przycisk działa **tylko dla roli administracyjnej**
  (`HOUSE_AUCTION_ADMIN_ROLE_ID`, domyślnie ustawiona na stałą rolę) — każdy inny użytkownik dostanie
  odmowę. Administrator wypełnia modal: nazwa/opis domu, lokalizacja, cena wywoławcza, minimalna podbitka,
  opis. Bot publikuje na kanale `kanal` ogłoszenie aukcji z przyciskami **Licytuj** (dostępny dla
  wszystkich) i **Zakończ aukcję** (dostępny dla roli administracyjnej albo samego prowadzącego). Klik
  "Licytuj" otwiera modal na kwotę — musi być równa lub wyższa od ceny wywoławczej (pierwsza oferta) albo od
  aktualnej najwyższej oferty + minimalna podbitka (kolejne oferty), inaczej bot odrzuci ofertę z podaniem
  wymaganego minimum. Każda przyjęta oferta od razu aktualizuje ogłoszenie na żywo (najwyższa oferta +
  licytujący). "Zakończ aukcję" zamyka licytację, ogłasza zwycięzcę (albo brak ofert) i usuwa przyciski.
  Cały stan aukcji (oferty, licytujący, status) jest zapisany w trwałym rejestrze, więc przetrwa restart
  bota.

### Trwały rejestr danych (wymaga Railway Volume!)

Wszystkie panele (`stworz-dowod`, `weryfikacja`, `pojazd`, `mafia`, `zaloz-dom`, `aukcja-domow`)
automatycznie zapisują dane do jednego pliku JSON (`src/utils/registry.js`). **To już działa samo z
siebie** — problem w tym, że Railway domyślnie ma **efemeryczny dysk: cały plik znika przy każdym
redeployu** (czyli przy każdym `git push` na `main`, bo to właśnie wtedy Railway stawia świeży kontener),
jeśli nie podepniesz trwałego wolumenu:

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

Bez tego kroku bot nadal działa normalnie, ale rejestr resetuje się przy każdym redeployu z Railwaya.

### Łańcuch wymagań

Panel `pojazd` można spiąć z dowolną wcześniej nadaną rolą, np. z `stworz-dowod`/`weryfikacja`:

```
/panel stworz-dowod ranga:@Obywatel
        ↓ (po wysłaniu dowodu automatycznie: rola @Obywatel)
/panel pojazd kanal:#pojazdy wymagana-ranga:@Obywatel
```

Kolejne panele (np. `/panel ...`) można dopisywać jako kolejne subkomendy w `src/commands/panel.js`.

Opcjonalnie: jeśli ustawisz zmienną `ADMIN_LOG_CHANNEL_ID`, bot będzie wysyłał na ten kanał log każdego
wysłanego dowodu, zarejestrowanego pojazdu/domu i wysłanej aukcji — razem z tym, kto i kiedy to zrobił.
Bez tej zmiennej logowanie jest po prostu pomijane.

## Ban na Robloxie (`/robloxban`)

**`/robloxban nick:<nick_roblox> czas:<liczba_dni_lub_perm> powod:<opis>`** *(wymaga uprawnienia Discorda
Blokuj użytkowników)* — wystawia ban na podany nick Roblox i publikuje kartę bana na stałym kanale logów
(`ROBLOX_BAN_CHANNEL_ID`, domyślnie już ustawiony). Bot próbuje zweryfikować nick w publicznym API Roblox
(prawdziwy avatar i link do profilu) — jeśli konto nie istnieje, karta i tak zostanie wysłana z wyraźnym
ostrzeżeniem. W polu `czas` podaj liczbę dni (np. `7`) albo słowo `perm` dla bana permanentnego.

**Ograniczenie do jednego serwera:** ta komenda działa wyłącznie na serwerze ustawionym zmienną
`LEGACY_GUILD_ID` (domyślnie już skonfigurowana na jedyny serwer bota). Na każdym innym serwerze komenda
grzecznie odmówi działania.

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
   Wygenerowanym linkiem zaproś bota na serwer Małopolska RP — **i na każdy kolejny serwer, na którym ma
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
   | `GUILD_ID` | ID jedynego serwera bota — Małopolska RP (lub kilka ID po przecinku, jeśli bot ma działać na kilku serwerach) |
   | `TARGET_CHANNEL_ID` | ID kanału, na który trafiają zatwierdzone dowody |
   | `ID_PREFIX` | np. `EH` — prefiks numeru dowodu |
   | `SERVER_NAME` | np. `Emergency Hamburg ROLEPLAY \| Małopolska RP` |
   | `EMBED_COLOR` | np. `#8b5cf6` |
   | `ADMIN_LOG_CHANNEL_ID` | opcjonalnie — ID kanału logów administracyjnych |
   | `REGISTRY_PATH` | opcjonalnie — ścieżka trwałego rejestru; ustaw dopiero po podpięciu Volume (patrz sekcja "Trwały rejestr danych" wyżej) |
   | `LEGACY_GUILD_ID` | opcjonalnie — ID serwera, na którym ma działać `/robloxban`; domyślnie już ustawione |
   | `ROBLOX_BAN_CHANNEL_ID` | opcjonalnie — ID kanału logów banów dla `/robloxban`; domyślnie już ustawione |
   | `HOUSE_AUCTION_ADMIN_ROLE_ID` | opcjonalnie — ID roli uprawnionej do rozpoczynania/kończenia aukcji domów (`/panel aukcja-domow`); domyślnie już ustawione |

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

Dla `/panel weryfikacja` (oraz opcjonalnej roli w `stworz-dowod`) bot dodatkowo musi mieć
uprawnienie **Zarządzaj rolami**, a jego własna rola (najwyższa rola bota na liście ról serwera) musi być
**wyżej** niż rola nadawana graczom — inaczej Discord nie pozwoli botowi jej przyznać.

Dla `/panel tickety` bot musi mieć uprawnienie **Zarządzaj kanałami** (tworzenie/usuwanie kanałów
ticketów i edycja ich uprawnień) oraz włączony **Message Content Intent** (patrz krok 4 w sekcji 1) —
bez niego transkrypt przy zamknięciu ticketu będzie pusty.
