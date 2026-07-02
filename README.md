# Emergency Hamburg RP — Bot Discord (Gdańsk RP)

Bot Discord do obsługi paneli weryfikacyjnych serwera. Aktualnie dostępne panele:

- **`/panel stworz-dowod [ranga:@rola]`** — publikuje embed z przyciskiem **"Stwórz Dowód"**. Po kliknięciu
  gracz wypełnia formularz (imię i nazwisko RP, wiek RP, obywatelstwo RP, nick Roblox). **Wiek musi być
  liczbą całkowitą 1–100** — inaczej bot odrzuci formularz z prośbą o poprawę. Bot weryfikuje nick w
  publicznym API Roblox (prawdziwy avatar + nazwa konta) i pokazuje graczowi prywatny (widoczny tylko dla
  niego) podgląd dowodu z przyciskami **Wyślij** / **Anuluj**. Po kliknięciu "Wyślij" gotowy dowód trafia na
  skonfigurowany kanał docelowy. Jeśli podasz opcjonalny parametr `ranga` (np. "Obywatel"), bot
  **automatycznie nada tę rolę** po wysłaniu dowodu — można ją potem wymagać w innych panelach (patrz niżej).

- **`/panel weryfikacja kanal:#kanał ranga:@rola`** — publikuje na wskazanym kanale embed z przyciskiem
  **"Zweryfikuj się"**. Po kliknięciu gracz podaje w formularzu swój nick Roblox — bot pokazuje mu (tylko
  jemu) prawdziwy avatar/nazwę konta oraz losowy 6-znakowy kod, który trzeba wkleić do opisu (bio) profilu
  Roblox. Po zapisaniu zmian gracz klika **"Sprawdź kod"** — jeśli kod faktycznie znajduje się w opisie,
  bot automatycznie nadaje mu skonfigurowaną rolę. Rola i dane weryfikacji są zakodowane w przyciskach, więc
  nic nie trzeba zapisywać w bazie danych — działa też po restarcie bota.

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
  przyszłego roku) — inaczej bot odrzuci formularz. Bot automatycznie generuje **numer rejestracyjny** w
  stylu Gdańska (`GD X1234`), 17-znakowy **numer VIN**, datę rejestracji oraz roczną ważność przeglądu i OC
  — wszystko trafia na kartę **Dowód Rejestracyjny Pojazdu RP**, którą gracz wysyła przyciskiem **Wyślij**
  na skonfigurowany kanał. Bez żadnej bazy danych — kanał docelowy i kategoria są zakodowane w przyciskach.

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

## Wymagania

- Node.js 20+
- Konto Discord Developer (aplikacja + bot)
- Konto na https://railway.app (hosting 24/7, połączony z tym repo na GitHubie)

## 1. Utworzenie bota w Discord Developer Portal

1. Wejdź na https://discord.com/developers/applications → **New Application**.
2. W zakładce **Bot** kliknij **Reset Token** i skopiuj token (to `DISCORD_TOKEN`).
3. W zakładce **General Information** skopiuj **Application ID** (to `CLIENT_ID`).
4. W zakładce **OAuth2 → URL Generator** zaznacz scope `bot` oraz `applications.commands`,
   z uprawnień zaznacz co najmniej: *Send Messages*, *Embed Links*, *Use Slash Commands*.
   Wygenerowanym linkiem zaproś bota na serwer Gdańsk RP.
5. Włącz Developer Mode w Discordzie (Ustawienia → Zaawansowane), kliknij PPM na serwer →
   **Kopiuj ID serwera** (to `GUILD_ID`), oraz PPM na kanał docelowy dowodów → **Kopiuj ID kanału**
   (to `TARGET_CHANNEL_ID`).

## 2. Wdrożenie na Railway (hosting 24/7)

1. Załóż konto na https://railway.app (najprościej: zaloguj się przez GitHub).
2. **New Project → Deploy from GitHub repo** → wybierz to repozytorium i branch `main`.
3. Railway samo wykryje aplikację Node.js (Nixpacks), zainstaluje zależności i uruchomi `npm start`.
4. W zakładce **Variables** projektu dodaj zmienne środowiskowe (te same nazwy co w `.env.example`):

   | Zmienna | Opis |
   |---|---|
   | `DISCORD_TOKEN` | token bota |
   | `CLIENT_ID` | Application ID |
   | `GUILD_ID` | ID serwera Gdańsk RP |
   | `TARGET_CHANNEL_ID` | ID kanału, na który trafiają zatwierdzone dowody |
   | `ID_PREFIX` | np. `EH` — prefiks numeru dowodu |
   | `SERVER_NAME` | np. `Emergency Hamburg ROLEPLAY \| Gdańsk RP` |
   | `EMBED_COLOR` | np. `#8b5cf6` |
   | `ADMIN_LOG_CHANNEL_ID` | opcjonalnie — ID kanału logów administracyjnych |

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

Dla `/panel weryfikacja` bot dodatkowo musi mieć uprawnienie **Zarządzaj rolami**, a jego własna
rola (najwyższa rola bota na liście ról serwera) musi być **wyżej** niż rola nadawana graczom —
inaczej Discord nie pozwoli botowi jej przyznać i weryfikacja zakończy się błędem.
