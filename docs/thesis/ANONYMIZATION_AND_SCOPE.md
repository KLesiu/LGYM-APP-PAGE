# Wariant demonstracyjny do pracy inżynierskiej

## Cel gałęzi

Gałąź `thesis/anonymized-ui` przygotowuje neutralny wariant demonstracyjny panelu webowego. Zachowano działające przepływy biznesowe oraz kontrakty API, natomiast usunięto z warstwy prezentacji nazwę i charakterystyczny wygląd produktu komercyjnego.

Wariant demonstracyjny korzysta z roboczej, opisowej nazwy **Training Hub**. Nie jest to nowa marka handlowa, lecz neutralna etykieta używana wyłącznie w dokumentacji i podczas prezentacji pracy.

## Zakres zmiany

- zastąpienie widocznej nazwy produktu w tłumaczeniach,
- nowy znak graficzny przechowywany w `public/training-hub-mark.svg`,
- nowa paleta granatowo-turkusowa oraz zmieniona geometria kontrolek,
- neutralny tytuł dokumentu HTML, favicon i opis strony,
- oddzielenie motywu pracy dyplomowej od preferencji motywu produktu produkcyjnego.

## Elementy zachowane bez zmian

- modele danych i wygenerowany klient OpenAPI,
- routing oraz kontrola dostępu zależna od ról i uprawnień,
- moduły trenera, użytkownika i administratora,
- komunikacja z istniejącym API.

## Zakres przekazywany uczelni

Do repozytorium lub archiwum przekazywanego uczelni powinny trafić wyłącznie pliki z tej gałęzi, niezbędne do uruchomienia panelu demonstracyjnego. Nie należy dołączać:

- produkcyjnych sekretów i plików środowiskowych,
- historii Git zawierającej wcześniejsze materiały identyfikacji wizualnej,
- plików wdrożeniowych odnoszących się do produkcyjnych domen,
- oryginalnych materiałów marketingowych i plików graficznych produktu.

Wewnętrzne nazwy techniczne mogą pozostać w kontraktach API, jeżeli ich zmiana naruszałaby kompatybilność. W tekście pracy powinny być opisywane neutralnie, np. jako „system”, „aplikacja mobilna”, „panel trenera” i „serwer API”.

## Weryfikacja przed eksportem

1. Zbudować aplikację poleceniem `npm run build`.
2. Uruchomić wariant produkcyjny lokalnie i przejść przez logowanie, listę podopiecznych, szczegóły podopiecznego, plan treningowy oraz raporty.
3. W przeglądarce wyszukać widoczne wystąpienia dawnej nazwy produktu.
4. Sprawdzić, czy w paczce nie ma plików `.env`, kluczy, certyfikatów ani adresów środowiska produkcyjnego.
5. Do dokumentacji dołączyć numer commita lub tag wariantu demonstracyjnego.
