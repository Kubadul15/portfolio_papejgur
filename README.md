# Emergency Hamburg RP — Bot Discord (Gdańsk RP)

Bot Discord do obsługi paneli weryfikacyjnych serwera. Aktualnie dostępny panel:

- **`/panel stworz-dowod`** — publikuje embed z przyciskiem **"Stwórz Dowód"**. Po kliknięciu gracz wypełnia
  formularz (imię i nazwisko RP, wiek RP, obywatelstwo RP, nick Roblox). Bot weryfikuje nick w publicznym
  API Roblox (prawdziwy avatar + nazwa konta) i pokazuje graczowi prywatny (widoczny tylko dla niego) podgląd
  dowodu z przyciskami **Wyślij** / **Anuluj**. Po kliknięciu "Wyślij" gotowy dowód trafia na skonfigurowany
  kanał docelowy.

Kolejne panele (np. `/panel ...`) można dopisywać jako kolejne subkomendy w `src/commands/panel.js`.

## Wymagania

- Node.js 20+
- Konto Discord Developer (aplikacja + bot)
- Komputer, który ma działać 24/7 (będzie jednocześnie self-hosted runnerem GitHub Actions)

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

## 2. Konfiguracja repo (GitHub Secrets)

W repo: **Settings → Secrets and variables → Actions → New repository secret**, dodaj:

| Secret | Opis |
|---|---|
| `DISCORD_TOKEN` | token bota |
| `CLIENT_ID` | Application ID |
| `GUILD_ID` | ID serwera Gdańsk RP |
| `TARGET_CHANNEL_ID` | ID kanału, na który trafiają zatwierdzone dowody |
| `ID_PREFIX` | np. `EH` — prefiks numeru dowodu |
| `SERVER_NAME` | np. `Emergency Hamburg ROLEPLAY \| Gdańsk RP` |
| `EMBED_COLOR` | np. `#8b5cf6` |

**Ważne:** trzymaj to repo jako **prywatne**. Self-hosted runner wykonuje kod z tego repo na Twoim
komputerze — na publicznym repo ktoś obcy mógłby podesłać złośliwy kod (dlatego workflow celowo
uruchamia się tylko na `push` do `main`, nigdy na `pull_request`).

## 3. Rejestracja własnego komputera jako self-hosted runner

1. W repo: **Settings → Actions → Runners → New self-hosted runner**, wybierz swój system operacyjny.
2. Wykonaj u siebie polecenia pokazane przez GitHub (pobranie paczki `actions-runner`, `./config.sh`
   z tokenem podanym na tej stronie).
3. Zainstaluj runnera jako usługę systemową, żeby startował automatycznie po restarcie komputera:
   - Linux/macOS: `sudo ./svc.sh install && sudo ./svc.sh start`
   - Windows (jako Administrator): `./svc install` i `./svc start`

## 4. Instalacja Node.js i pm2 na komputerze

```bash
npm install -g pm2
pm2 startup   # wykonaj polecenie, które pm2 wypisze, żeby pm2 też startował po restarcie systemu
```

## 5. Deploy

Wystarczy zrobić `git push` na branch `main` — workflow `.github/workflows/deploy.yml`:

1. pobiera najnowszy kod na Twój komputer (runner),
2. instaluje zależności (`npm ci`),
3. zapisuje `.env` z GitHub Secrets,
4. rejestruje/aktualizuje komendy slash (`node src/deploy-commands.js`),
5. uruchamia/restartuje bota przez `pm2` (`pm2 startOrRestart ecosystem.config.js`).

Od tego momentu bot działa 24/7 na Twoim komputerze i sam się aktualizuje po każdym pushu.
Można też odpalić deploy ręcznie: **Actions → Deploy bota (self-hosted 24/7) → Run workflow**.

### Przydatne komendy pm2 (na komputerze z runnerem)

```bash
pm2 status                          # sprawdź czy bot działa
pm2 logs emergency-hamburg-rp-bot   # podgląd logów na żywo
pm2 restart emergency-hamburg-rp-bot
```

## Uruchomienie lokalne (bez GitHub Actions, do testów)

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
płacić). Do stałego działania bota służy self-hosted runner opisany w krokach 1–5 powyżej.

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
