# GitHub Test Data App

Aplikacja demonstracyjna zapisuje niepoufne rekordy (testowy e-mail + notatka) do pliku `test-records.jsonl` w repozytorium GitHub. Nie ma pola hasła.

## Ważne
GitHub Pages jest hostingiem statycznym i nie uruchomi `server.js`. Do zapisu w repozytorium potrzebujesz uruchomić ten backend na hostingu obsługującym Node.js (np. własny serwer lub platforma hostingowa dla aplikacji Node). Nie umieszczaj tokena GitHub w `public/index.html` ani w innym kodzie dostępnym przeglądarce.

## Konfiguracja
Ustaw zmienne środowiskowe na serwerze backendu:
- `GITHUB_TOKEN` — token fine-grained z dostępem tylko do wybranego repozytorium i uprawnieniem **Contents: Read and write**.
- `GITHUB_OWNER` — nazwa właściciela repozytorium lub organizacji.
- `GITHUB_REPO` — nazwa repozytorium.
- `GITHUB_BRANCH` — opcjonalnie, domyślnie `main`.
- `GITHUB_FILE_PATH` — opcjonalnie, domyślnie `test-records.jsonl`.

## Uruchomienie lokalne
Wymaga Node.js 18+.
1. Ustaw zmienne środowiskowe w terminalu.
2. Uruchom `npm start`.
3. Otwórz `http://localhost:3000`.

Na GitHubie plik `test-records.jsonl` zostanie utworzony przy pierwszym zapisie. Każdy rekord to jeden wiersz JSON.

## Ograniczenia
To przykład edukacyjny. Przed publicznym wdrożeniem dodaj uwierzytelnianie, ochronę przed spamem, limity żądań i walidację danych. Nie zapisuj sekretów ani danych logowania.
