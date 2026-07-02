# Emergency Hamburg RP — Bot Discord (Gdańsk RP)

Bot Discord do obsługi paneli weryfikacyjnych serwera. Aktualnie dostępne panele:

- **`/panel stworz-dowod`** — publikuje embed z przyciskiem **"Stwórz Dowód"**. Po kliknięciu gracz wypełnia
  formularz (imię i nazwisko RP, wiek RP, obywatelstwo RP, nick Roblox). Bot weryfikuje nick w publicznym
  API Roblox (prawdziwy avatar + nazwa konta) i pokazuje graczowi prywatny (widoczny tylko dla niego) podgląd
  dowodu z przyciskami **Wyślij** / **Anuluj**. Po kliknięciu "Wyślij" gotowy dowód trafia na skonfigurowany
  kanał docelowy.

- **`/panel weryfikacja kanal:#kanał ranga:@rola`** — publikuje na wskazanym kanale embed z przyciskiem
  **"Zweryfikuj się"**. Po kliknięciu gracz podaje w formularzu swój nick Roblox — bot pokazuje mu (tylko
  jemu) prawdziwy avatar/nazwę konta oraz losowy 6-znakowy kod, który trzeba wkleić do opisu (bio) profilu
  Roblox. Po zapisaniu zmian gracz klika **"Sprawdź kod"** — jeśli kod faktycznie znajduje się w opisie,
  bot automatycznie nadaje mu skonfigurowaną rolę. Rola i dane weryfikacji są zakodowane w przyciskach, więc
  nic nie trzeba zapisywać w bazie danych — działa też po restarcie bota.

- **`/panel prawojazdy kanal:#kanał`** — publikuje embed z przyciskiem **"Podejdź do egzaminu"**. Po
  kliknięciu gracz wybiera z listy **kategorię prawa jazdy** (pełna lista jak w polskim systemie: AM, A1,
  A2, A, B1, B, B+E, C1, C1+E, C, C+E, D1, D1+E, D, D+E, T — `src/data/licenseCategories.js`), potem
  wypełnia formularz zgłoszeniowy (imię i nazwisko RP, wiek RP, nick Roblox — weryfikowany tak samo jak w
  dowodzie), a na końcu, tak jak na prawdziwym egzaminie, odpowiada po kolei na pytania teoretyczne z 4
  odpowiedziami do wyboru (pytania w `src/data/examQuestions.js`). Dopuszczalna jest tylko jedna pomyłka —
  po zdanym egzaminie pojawia się karta **Prawo Jazdy RP** (bardzo podobna do Dowodu Osobistego RP) z
  wybraną kategorią, numerem i wynikiem, którą gracz wysyła przyciskiem **Wyślij** na wskazany przy
  tworzeniu panelu kanał. Cały przebieg egzaminu (kategoria, pytanie, wynik, kanał docelowy) jest
  zakodowany w przyciskach i treści wiadomości, więc też przetrwa restart bota.

Kolejne panele (np. `/panel ...`) można dopisywać jako kolejne subkomendy w `src/commands/panel.js`.

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
