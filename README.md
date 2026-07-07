# LGYM APP PAGE

> Frontend platform for gym/training operations with dedicated workspaces for **athletes**, **trainers**, and **administrators**.

---

## Spis treści / Table of contents

- [PL — README](#pl--readme)
  - [1. Executive summary](#1-executive-summary)
  - [2. Czym jest projekt](#2-czym-jest-projekt)
  - [3. Cele biznesowe](#3-cele-biznesowe)
  - [4. Dlaczego ten produkt ma znaczenie](#4-dlaczego-ten-produkt-ma-znaczenie)
  - [5. Role użytkowników](#5-role-użytkowników)
  - [6. Najważniejsze funkcje aplikacji](#6-najważniejsze-funkcje-aplikacji)
  - [7. Kluczowe przepływy biznesowe](#7-kluczowe-przepływy-biznesowe)
  - [8. Założenia produktowe i techniczne](#8-założenia-produktowe-i-techniczne)
  - [9. Tech stack](#9-tech-stack)
  - [10. Architektura techniczna](#10-architektura-techniczna)
  - [11. Routing i obszary aplikacji](#11-routing-i-obszary-aplikacji)
  - [12. API i integracje](#12-api-i-integracje)
  - [13. Uwierzytelnianie i autoryzacja](#13-uwierzytelnianie-i-autoryzacja)
  - [14. Internacjonalizacja](#14-internacjonalizacja)
  - [15. Model wdrożenia i uruchamiania](#15-model-wdrożenia-i-uruchamiania)
  - [16. Uruchomienie projektu lokalnie](#16-uruchomienie-projektu-lokalnie)
  - [17. Skrypty npm](#17-skrypty-npm)
  - [18. Zmienne środowiskowe](#18-zmienne-środowiskowe)
  - [19. Struktura projektu](#19-struktura-projektu)
  - [20. Jakość i walidacja](#20-jakość-i-walidacja)
  - [21. Ograniczenia i uwagi](#21-ograniczenia-i-uwagi)
- [EN — README](#en--readme)
  - [1. Executive summary](#1-executive-summary-1)
  - [2. What this project is](#2-what-this-project-is)
  - [3. Business goals](#3-business-goals)
  - [4. Why this product matters](#4-why-this-product-matters)
  - [5. User roles](#5-user-roles)
  - [6. Core application features](#6-core-application-features)
  - [7. Key business workflows](#7-key-business-workflows)
  - [8. Product and technical assumptions](#8-product-and-technical-assumptions)
  - [9. Tech stack](#9-tech-stack-1)
  - [10. Technical architecture](#10-technical-architecture)
  - [11. Routing and application areas](#11-routing-and-application-areas)
  - [12. API and integrations](#12-api-and-integrations)
  - [13. Authentication and authorization](#13-authentication-and-authorization)
  - [14. Internationalization](#14-internationalization)
  - [15. Delivery and deployment model](#15-delivery-and-deployment-model)
  - [16. Running the project locally](#16-running-the-project-locally)
  - [17. npm scripts](#17-npm-scripts)
  - [18. Environment variables](#18-environment-variables)
  - [19. Project structure](#19-project-structure)
  - [20. Quality and validation](#20-quality-and-validation)
  - [21. Limitations and notes](#21-limitations-and-notes)

---

# PL — README

## 1. Executive summary

LGYM APP PAGE to webowy frontend platformy LGYM, który spina trzy krytyczne perspektywy produktu w jednym interfejsie:

- **athlete** — codzienna praca użytkownika końcowego,
- **trainer** — operacyjna praca trenera z podopiecznymi,
- **admin** — kontrola platformy, użytkowników i konfiguracji wersji.

Biznesowo projekt jest centrum operacyjnym produktu: to tutaj dzieje się zarządzanie relacją trener–podopieczny, planami treningowymi, raportami i biblioteką ćwiczeń. Technicznie jest to SPA zbudowane w **Vue 3 + TypeScript + Vite**, z routingiem po stronie klienta, wygenerowanym klientem API z OpenAPI oraz z warstwą autoryzacji opartą o role i claimy.

Jeżeli ktoś ma w 5 minut zrozumieć, czym jest `./page`, odpowiedź brzmi: to panel operacyjny LGYM dla wszystkich ról biznesowych, zaprojektowany tak, aby jedna aplikacja webowa mogła obsłużyć onboarding, codzienną pracę i administrację produktem.

## 2. Czym jest projekt

LGYM APP PAGE to frontend aplikacji webowej do obsługi procesów związanych z treningiem, relacją trener–podopieczny oraz administracją platformą.

Projekt dostarcza trzy główne przestrzenie robocze:

- **Strefa zawodnika / athlete** — zarządzanie relacją z trenerem i dostęp do biblioteki ćwiczeń,
- **Strefa trenera / trainer** — zarządzanie podopiecznymi, planami treningowymi, raportami, zaproszeniami i ustawieniami,
- **Strefa administratora / admin** — zarządzanie użytkownikami, rolami, konfiguracją wersji aplikacji i biblioteką ćwiczeń.

Jest to aplikacja typu SPA oparta o Vue 3, TypeScript i Vite, z routingiem po stronie klienta, integracją z backend API i wielojęzycznym interfejsem.

## 3. Cele biznesowe

Projekt realizuje kilka celów biznesowych:

- centralizacja współpracy między trenerem a podopiecznym,
- uproszczenie zarządzania planami treningowymi i ich dniami,
- umożliwienie pracy na wspólnej bibliotece ćwiczeń,
- obsługa zaproszeń i relacji trener–zawodnik,
- zbieranie i przeglądanie raportów od podopiecznych,
- zapewnienie panelu administracyjnego do kontroli użytkowników i konfiguracji platformy,
- wsparcie dla różnych ról biznesowych w jednej aplikacji.

## 4. Dlaczego ten produkt ma znaczenie

W praktyce `page` nie jest „tylko frontendem”. To warstwa, która:

- redukuje chaos operacyjny po stronie trenerów,
- skraca ścieżkę od stworzenia planu do przekazania go zawodnikowi,
- daje administratorom kontrolę nad użytkownikami i wersjami aplikacji,
- utrzymuje spójny model dostępu dla wielu ról w jednym produkcie,
- pozwala zespołowi produktowemu rozwijać web i mobile wokół wspólnego kontraktu API.

To ważne także z perspektywy zespołu: frontend webowy jest naturalnym miejscem do szybszej obsługi procesów administracyjnych i trenerskich niż mobile, dlatego `page` pełni rolę zaplecza operacyjnego całego ekosystemu LGYM.

## 5. Role użytkowników

### Athlete / użytkownik końcowy

- akceptuje lub odrzuca zaproszenia od trenera,
- sprawdza status relacji z trenerem,
- korzysta z biblioteki ćwiczeń,
- działa w dedykowanym interfejsie użytkownika.

### Trainer / trener

- zarządza listą podopiecznych,
- przegląda szczegóły podopiecznego,
- tworzy, edytuje i udostępnia plany treningowe,
- zarządza dniami planów i ćwiczeniami,
- wysyła zaproszenia do zawodników,
- zarządza szablonami raportów i przegląda przesłane raporty,
- zapisuje feedback trenerski do raportów,
- korzysta z ustawień konta, w tym łączenia konta Google.

### Admin / administrator

- zarządza użytkownikami i rolami,
- administruje biblioteką ćwiczeń,
- zarządza konfiguracją wersji aplikacji mobilnych,
- korzysta z odseparowanego panelu administracyjnego.

## 6. Najważniejsze funkcje aplikacji

### Uwierzytelnianie i wejście do systemu

- logowanie użytkownika,
- logowanie administratora,
- rejestracja,
- obsługa sesji po stronie klienta,
- logowanie przez Google,
- podłączanie zewnętrznego konta Google do konta trenera.

### Strefa trenera

#### Zarządzanie podopiecznymi

- lista podopiecznych,
- przechodzenie do szczegółów podopiecznego,
- odpinanie relacji z podopiecznym,
- podgląd danych i historii w układzie zakładek.

#### Szczegóły podopiecznego

W obrębie szczegółów podopiecznego aplikacja obsługuje m.in.:

- historię treningów,
- plany treningowe przypisane do podopiecznego,
- raporty i ich podgląd,
- pomiary / dane postępów,
- szybkie przełączanie między obszarami pracy.

#### Raporty i feedback trenerski

- przegląd wysłanych odpowiedzi na raporty,
- podgląd pytań i odpowiedzi podopiecznego,
- zapisywanie komentarzy do pojedynczych odpowiedzi,
- zapisywanie ogólnego komentarza trenera do całego raportu.

#### Plany treningowe

- lista planów treningowych trenera,
- tworzenie i edycja planów,
- ustawianie aktywnego planu,
- udostępnianie planu za pomocą share code,
- edycja dni planu,
- budowa dnia treningowego z ćwiczeń, serii i parametrów wykonania.

#### Zaproszenia

- wysyłka zaproszeń do zawodników przez e-mail,
- przegląd historii zaproszeń,
- cofanie aktywnych zaproszeń,
- paginacja i obsługa danych tabelarycznych.

#### Biblioteka ćwiczeń

- przegląd ćwiczeń globalnych i prywatnych,
- wyszukiwanie i filtrowanie,
- wykorzystanie ćwiczeń w planach treningowych.

#### Ustawienia konta

- podgląd podłączonych metod logowania,
- połączenie konta z Google,
- obsługa błędów sesji i ponownego logowania.

### Strefa zawodnika

- podgląd relacji z trenerem,
- akceptowanie lub odrzucanie zaproszenia,
- obsługa publicznego statusu zaproszenia,
- dostęp do biblioteki ćwiczeń.

### Strefa administratora

- zarządzanie użytkownikami,
- zarządzanie rolami i uprawnieniami,
- konfiguracja wersji aplikacji,
- zarządzanie administracyjną biblioteką ćwiczeń.

## 7. Kluczowe przepływy biznesowe

### 1. Trener pozyskuje i aktywuje podopiecznego

1. Trener wysyła zaproszenie.
2. Zawodnik akceptuje lub odrzuca relację.
3. System utrzymuje status współpracy.
4. Trener może przejść do szczegółów podopiecznego i rozpocząć pracę.

### 2. Trener buduje i udostępnia plan treningowy

1. Tworzy plan.
2. Dodaje dni planu.
3. Składa dzień z ćwiczeń, serii i parametrów.
4. Ustawia aktywny plan lub udostępnia go przez share code.

### 3. Podopieczny raportuje, trener daje feedback

1. Podopieczny wysyła raport.
2. Trener przegląda pytania i odpowiedzi.
3. Zapisuje komentarze do odpowiedzi lub cały komentarz zbiorczy.
4. Feedback wraca do obiegu współpracy trener–podopieczny.

### 4. Administrator utrzymuje porządek platformy

1. Zarządza użytkownikami i rolami.
2. Kontroluje bibliotekę ćwiczeń.
3. Utrzymuje konfigurację wersji aplikacji mobilnych.

To właśnie te przepływy sprawiają, że `page` jest projektem nie tylko prezentacyjnym, ale realnie operacyjnym.

## 8. Założenia produktowe i techniczne

Na podstawie kodu repozytorium można przyjąć następujące założenia:

- aplikacja jest frontendem współpracującym z zewnętrznym backend API,
- role biznesowe są rozdzielone na poziomie routingu i logiki dostępu,
- sesja użytkownika jest utrzymywana po stronie klienta w `localStorage`,
- backend zwraca JWT oraz informacje o rolach i claimach uprawnień,
- API dla większości zasobów jest typowane i częściowo generowane z OpenAPI,
- interfejs jest dostępny minimum w dwóch językach: polskim i angielskim,
- aplikacja jest przygotowana do obsługi działań idempotentnych po stronie API,
- frontend działa jako SPA i zakłada nowoczesne środowisko przeglądarkowe.

## 9. Tech stack

### Frontend

- **Vue 3**
- **TypeScript**
- **Vue Router 4**
- **Vue I18n**
- **Vuetify 3**
- **Tailwind CSS**

### Tooling

- **Vite**
- **vue-tsc**
- **Orval** — generowanie klienta API z OpenAPI / Swagger,
- **Prettier**
- **dotenv**

### UI / design system

- komponenty Vuetify,
- utility classes Tailwinda,
- własne tokeny i zmienne CSS,
- ikony **MDI / Material Design Icons**.

## 10. Architektura techniczna

### Ogólny model aplikacji

Projekt jest zorganizowany jako SPA z następującymi warstwami:

- `pages/` — strony mapowane do routingu,
- `layouts/` — layouty dla ról i głównych obszarów aplikacji,
- `components/` — komponenty funkcjonalne i wielokrotnego użycia,
- `composables/` — współdzielona logika biznesowa oraz stan lokalny,
- `api/` — klient API (wygenerowany i ręczny),
- `locales/` — tłumaczenia,
- `plugins/` — konfiguracja i18n oraz Vuetify.

### Podejście do stanu

Projekt nie używa globalnego store typu Pinia/Vuex. Zamiast tego stosuje:

- composables do zarządzania logiką domenową,
- `localStorage` do przechowywania sesji,
- stan komponentowy dla widoków i formularzy.

### Interceptor `fetch`

W `src/main.ts` aplikacja podmienia `window.fetch`, aby automatycznie:

- dołączać `Accept-Language`,
- ustawiać `Authorization: Bearer ...` dla wywołań API,
- dodawać `Idempotency-Key`,
- podpinać względne URL-e pod `VITE_API_BASE_URL`.

To oznacza, że zarówno ręczne wrappery API, jak i wygenerowany klient korzystają ze wspólnych zasad komunikacji.

### Pozycja `page` w całym ekosystemie LGYM

Z perspektywy architektury produktu `page` pełni rolę:

- panelu operacyjnego dla trenerów,
- panelu kontrolnego dla administratorów,
- webowego punktu wejścia dla części flow użytkownika końcowego,
- partnera dla aplikacji `mobile`, współdzielącego backend i kontrakt API.

## 11. Routing i obszary aplikacji

Routing opiera się o `createWebHistory()` i rozdziela aplikację na trzy główne obszary:

- `/admin`
- `/trainer`
- `/athlete`

Dostęp jest kontrolowany przez route guards oraz helpery:

- `hasAdminAccess()`
- `hasTrainerAccess()`
- `hasUserAccess()`

Router obsługuje m.in.:

- przekierowania po zalogowaniu,
- wymuszenie odpowiedniej roli,
- przekazanie docelowego `redirect` po ponownym logowaniu.

Taki model routingu jest istotny biznesowo: zamiast utrzymywać trzy osobne aplikacje, produkt utrzymuje jedną warstwę frontendową z odseparowanym dostępem.

## 12. API i integracje

### Orval / OpenAPI

Projekt używa **Orval** do generowania klienta API:

- źródło OpenAPI: `ORVAL_SWAGGER_URL` lub lokalny Swagger,
- wyjście klienta: `src/api/generated/demo.ts`,
- modele DTO: `src/api/model`.

### Ręczne wrappery API

Poza klientem generowanym istnieją też ręczne moduły, np.:

- `src/api/auth.ts`
- `src/api/account.ts`
- `src/api/trainerInvitations.ts`

To podejście jest używane głównie tam, gdzie potrzebna jest lekka, ręcznie kontrolowana warstwa komunikacji.

### Integracje zewnętrzne

- **Google OAuth / Google Sign-In**
- backend API przez `fetch`
- Swagger / OpenAPI jako źródło kontraktu API.

## 13. Uwierzytelnianie i autoryzacja

Sesja użytkownika przechowuje m.in.:

- token JWT,
- główną rolę,
- listę ról,
- permission claims,
- podstawowe dane użytkownika.

Dane są przechowywane w `localStorage`, m.in. pod kluczami:

- `lgym.auth.token`
- `lgym.auth.role`
- `lgym.auth.roles`
- `lgym.auth.permissionClaims`

System dostępu opiera się na połączeniu:

- obecności tokena,
- roli użytkownika,
- claimów uprawnień.

To ważne, bo produkt nie rozdziela autoryzacji wyłącznie po roli — korzysta także z claimów, co daje lepszą kontrolę granulacji dostępu w panelu administracyjnym i trenerkim.

## 14. Internacjonalizacja

Aplikacja wspiera dwa języki:

- `pl` — domyślny,
- `en` — fallback.

Tłumaczenia znajdują się w:

- `src/locales/pl.json`
- `src/locales/en.json`

Lokalizacja wpływa nie tylko na UI, ale również na nagłówek `Accept-Language` wysyłany do API.

## 15. Model wdrożenia i uruchamiania

Projekt jest przygotowany do działania jako statyczne SPA serwowane przez Nginx.

Najważniejsze cechy modelu wdrożenia:

- build frontendowy powstaje w Dockerze,
- runtime jest oparty o obraz `cgr.dev/chainguard/nginx`,
- build-time przyjmuje m.in. `VITE_API_BASE_URL` oraz `VITE_GOOGLE_CLIENT_ID`,
- aplikacja jest serwowana na porcie `8080`,
- routing SPA wymaga fallbacku do `index.html`,
- `public/google-callback.html` musi pozostać dostępny jako fizyczny plik.

To oznacza, że `page` można łatwo osadzić w standardowym pipeline deploymentowym bez dodatkowego serwera Node po stronie runtime.

## 16. Uruchomienie projektu lokalnie

### Wymagania

- Node.js 18+ (zalecane nowoczesne LTS)
- npm
- dostęp do backend API lub lokalnego środowiska developerskiego

### Instalacja

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Typecheck

```bash
npm run typecheck
```

### Build produkcyjny

```bash
npm run build
```

### Podgląd buildu

```bash
npm run preview
```

### Regeneracja klienta API

```bash
npm run orval
```

### Uruchomienie frontendu w Dockerze

Build obrazu z ustawieniem docelowego API i Google Client ID:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  --build-arg VITE_GOOGLE_CLIENT_ID=your-google-client-id \
  -t lgym-page .
```

Start kontenera:

```bash
docker run -p 8080:8080 lgym-page
```

Alternatywnie przez Docker Compose:

```bash
docker compose up --build
```

## 17. Skrypty npm

W projekcie zdefiniowano:

```json
{
  "dev": "vite",
  "build": "npm run typecheck && vite build",
  "preview": "vite preview",
  "typecheck": "vue-tsc --noEmit",
  "orval": "orval --config orval.config.ts"
}
```

## 18. Zmienne środowiskowe

Najważniejsze zmienne wynikające z kodu:

### Frontend

- `VITE_API_BASE_URL` — bazowy adres backend API, domyślnie: `https://localhost:7025`
- `VITE_GOOGLE_CLIENT_ID` — client ID dla logowania Google

### Generowanie klienta API

- `ORVAL_SWAGGER_URL` — adres Swagger / OpenAPI używany przez Orval

Przykładowy plik `.env.local`:

```env
VITE_API_BASE_URL=https://localhost:7025
VITE_GOOGLE_CLIENT_ID=your-google-client-id
ORVAL_SWAGGER_URL=https://localhost:7025/swagger/v1/swagger.json
```

## 19. Struktura projektu

```text
src/
├─ api/
│  ├─ generated/        # wygenerowany klient API
│  ├─ model/            # DTO i typy modeli
│  └─ *.ts              # ręczne wrappery API
├─ components/          # komponenty UI i feature components
├─ composables/         # logika współdzielona i domenowa
├─ layouts/             # layouty admin / trainer / user
├─ locales/             # tłumaczenia PL / EN
├─ pages/               # strony routingu
├─ plugins/             # i18n, vuetify
├─ router/              # konfiguracja routera i guardów
└─ styles/              # Tailwind + tokeny CSS
```

## 20. Jakość i walidacja

Minimalny standard walidacji zmian w projekcie:

- `npm run typecheck`
- `npm run build`

W praktyce oznacza to:

- kontrolę typów TypeScript,
- weryfikację spójności komponentów Vue,
- sprawdzenie, czy aplikacja buduje się produkcyjnie.

## 21. Ograniczenia i uwagi

- część klienta API jest generowana, a część utrzymywana ręcznie,
- pełny zakres funkcjonalny zależy od zgodności kontraktu backend API,
- część procesów biznesowych jest widoczna głównie przez routing, DTO i tłumaczenia, więc README opisuje realny stan frontendowego repozytorium,
- aktualnie aplikacja łączy podejście komponentowe Vuetify z utility-first stylingiem Tailwind,
- rozmiar produkcyjnych bundle’i może wymagać dalszego code-splittingu w przyszłości.

---

# EN — README

## 1. Executive summary

LGYM APP PAGE is the web frontend of the LGYM product ecosystem. It brings together three critical business perspectives in one interface:

- **athlete** — daily end-user workflows,
- **trainer** — operational coaching workflows,
- **admin** — platform governance, user management, and version control.

From a business perspective, this project is the operational hub of the product. From a technical perspective, it is a **Vue 3 + TypeScript + Vite** SPA with client-side routing, OpenAPI-generated API clients, and access control based on roles plus permission claims.

If someone needs the short version: `./page` is the LGYM web control center for coaches, athletes, and administrators.

## 2. What this project is

LGYM APP PAGE is the frontend of a web platform used to manage training-related workflows, trainer–athlete relationships, and platform administration.

The product exposes three main workspaces:

- **Athlete area** — trainer relationship handling and exercise library access,
- **Trainer area** — trainee management, training plans, reports, invitations, exercises, and account settings,
- **Admin area** — user management, roles, app version configuration, and exercise administration.

It is a Vue 3 + TypeScript single-page application that communicates with a backend API and supports bilingual UI content.

## 3. Business goals

The application supports several business goals:

- centralize collaboration between trainers and athletes,
- simplify training plan management,
- provide a shared exercise library,
- support invitation-based trainer–athlete relationship management,
- collect and review athlete reports,
- expose an administration panel for platform control,
- support multiple business roles inside one product.

## 4. Why this product matters

In practice, `page` is not “just a frontend”. It:

- reduces operational friction for trainers,
- shortens the path from plan creation to athlete delivery,
- gives admins direct control over users and app versions,
- keeps a unified multi-role access model inside one product,
- allows both web and mobile to evolve around a shared backend contract.

This makes `page` the operational backbone of LGYM, not only its web presentation layer.

## 5. User roles

### Athlete

- accepts or rejects trainer invitations,
- checks trainer relationship status,
- uses the exercise library,
- works in a dedicated athlete-facing UI.

### Trainer

- manages trainees,
- opens trainee details,
- creates, edits, and shares training plans,
- manages plan days and exercises,
- sends invitations to athletes,
- manages report templates and reviews submissions,
- stores trainer feedback for submitted reports,
- uses account settings including Google account linking.

### Administrator

- manages users and roles,
- administrates the exercise library,
- manages mobile app version configuration,
- operates inside a separate admin panel.

## 6. Core application features

### Authentication and access

- user login,
- administrator login,
- registration,
- client-side session persistence,
- Google sign-in,
- linking a Google account to an existing trainer profile.

### Trainer workspace

#### Trainee management

- trainee list,
- trainee details navigation,
- unlinking a trainer–athlete relationship,
- tab-based detail workspace.

#### Trainee details

The trainee details area includes workflows such as:

- training history,
- trainee-related training plans,
- reports and report previews,
- measurement / progress-related views,
- fast switching between work sections.

#### Reports and trainer feedback

- reviewing report submissions,
- previewing template questions and athlete answers,
- saving per-answer trainer comments,
- saving an overall trainer note for the full submission.

#### Training plans

- trainer training plan list,
- create and edit flows,
- active plan selection,
- sharing plans via share code,
- plan day editor,
- training day composition using exercises, sets, and execution parameters.

#### Invitations

- sending invitations by email,
- browsing invitation history,
- revoking pending invitations,
- table-oriented and paginated workflows.

#### Exercise library

- browsing global and private exercises,
- search and filtering,
- using exercises inside training plans.

#### Account settings

- viewing connected sign-in providers,
- linking Google,
- handling expired-session flows and re-login.

### Athlete workspace

- viewing trainer relationship status,
- accepting or rejecting an invitation,
- handling public invitation status,
- accessing the exercise library.

### Admin workspace

- user management,
- role and permission management,
- application version configuration,
- admin-level exercise library management.

## 7. Key business workflows

### 1. Coach acquires and activates a trainee

1. The trainer sends an invitation.
2. The athlete accepts or rejects it.
3. The relationship state becomes actionable.
4. The trainer continues into the trainee detail workspace.

### 2. Coach builds and shares a training plan

1. A plan is created.
2. Plan days are defined.
3. Exercises, sets, and execution parameters are assigned.
4. The plan is activated or shared with a share code.

### 3. Athlete reports, trainer responds

1. The athlete submits a report.
2. The trainer reviews answers.
3. Feedback is stored per answer or for the full submission.
4. The collaboration loop stays inside the product.

### 4. Admin keeps the platform consistent

1. Users and roles are managed.
2. Exercise catalog quality is maintained.
3. Mobile app version configuration is controlled.

## 8. Product and technical assumptions

Based on the repository code, the following assumptions are valid:

- the application is a frontend for an external backend API,
- business roles are separated at the routing and access-control layer,
- the user session is stored in `localStorage`,
- the backend returns JWT tokens, roles, and permission claims,
- most API communication is typed and partly generated from OpenAPI,
- the UI supports at least Polish and English,
- API requests are designed with idempotency support in mind,
- the frontend is built as a modern SPA.

## 9. Tech stack

### Frontend

- **Vue 3**
- **TypeScript**
- **Vue Router 4**
- **Vue I18n**
- **Vuetify 3**
- **Tailwind CSS**

### Tooling

- **Vite**
- **vue-tsc**
- **Orval** — API client generation from OpenAPI / Swagger,
- **Prettier**
- **dotenv**

### UI / design system

- Vuetify components,
- Tailwind utility classes,
- custom CSS tokens and variables,
- **MDI / Material Design Icons**.

## 10. Technical architecture

### General application model

The SPA is organized into the following main layers:

- `pages/` — route-level pages,
- `layouts/` — role-specific application shells,
- `components/` — reusable and feature-specific UI blocks,
- `composables/` — shared business logic and local state handling,
- `api/` — generated and hand-written API client modules,
- `locales/` — translations,
- `plugins/` — i18n and Vuetify configuration.

### State approach

The repository does not use a centralized store such as Pinia or Vuex. Instead, it relies on:

- composables for domain logic,
- `localStorage` for session persistence,
- component-local state for pages and forms.

### `fetch` interceptor

In `src/main.ts`, the app overrides `window.fetch` to automatically:

- append `Accept-Language`,
- attach `Authorization: Bearer ...` for API calls,
- add an `Idempotency-Key`,
- resolve relative URLs against `VITE_API_BASE_URL`.

This creates a consistent network layer for both hand-written and generated API clients.

### Role of `page` in the wider LGYM ecosystem

Architecturally, `page` acts as:

- the operational dashboard for trainers,
- the control panel for admins,
- a web entry point for selected end-user flows,
- the web counterpart to `mobile`, sharing one backend and one API contract.

## 11. Routing and application areas

Routing uses `createWebHistory()` and separates the app into three primary areas:

- `/admin`
- `/trainer`
- `/athlete`

Access is enforced through route guards and helper checks:

- `hasAdminAccess()`
- `hasTrainerAccess()`
- `hasUserAccess()`

The router also supports:

- post-login redirects,
- role enforcement,
- redirect preservation through the `redirect` query parameter.

This routing model matters because the product keeps one multi-role frontend instead of splitting the experience into separate applications.

## 12. API and integrations

### Orval / OpenAPI

The project uses **Orval** to generate a typed API client:

- OpenAPI source: `ORVAL_SWAGGER_URL` or a local Swagger endpoint,
- generated client target: `src/api/generated/demo.ts`,
- DTO output: `src/api/model`.

### Hand-written API wrappers

Besides the generated client, the codebase also contains lightweight manual wrappers such as:

- `src/api/auth.ts`
- `src/api/account.ts`
- `src/api/trainerInvitations.ts`

This is useful when a simpler or more explicit integration layer is preferred.

### External integrations

- **Google OAuth / Google Sign-In**
- backend API through native `fetch`
- Swagger / OpenAPI as the contract source.

## 13. Authentication and authorization

The client-side session stores information such as:

- JWT token,
- primary role,
- role list,
- permission claims,
- basic user profile data.

This data is stored in `localStorage`, using keys including:

- `lgym.auth.token`
- `lgym.auth.role`
- `lgym.auth.roles`
- `lgym.auth.permissionClaims`

Access control is based on a combination of:

- token presence,
- role membership,
- permission claims.

That distinction matters because role-only access would not be granular enough for the admin and trainer workflows represented in the UI.

## 14. Internationalization

The app supports two languages:

- `pl` — default,
- `en` — fallback.

Translation files live in:

- `src/locales/pl.json`
- `src/locales/en.json`

Locale selection affects both the UI and the `Accept-Language` header sent to the API.

## 15. Delivery and deployment model

The project is prepared to run as a static SPA served by Nginx.

Important characteristics:

- frontend build is produced in Docker,
- runtime is based on `cgr.dev/chainguard/nginx`,
- build-time configuration includes `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID`,
- the app listens on port `8080`,
- SPA routing requires an `index.html` fallback,
- `public/google-callback.html` must remain reachable as a physical file.

This makes the deployment model simple and infrastructure-friendly: no Node server is required for runtime delivery.

## 16. Running the project locally

### Requirements

- Node.js 18+ (modern LTS recommended)
- npm
- access to the backend API or a local development environment

### Install dependencies

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

### Typecheck

```bash
npm run typecheck
```

### Production build

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

### Regenerate API client

```bash
npm run orval
```

### Run the frontend in Docker

Build image with target API and Google Client ID:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  --build-arg VITE_GOOGLE_CLIENT_ID=your-google-client-id \
  -t lgym-page .
```

Run container:

```bash
docker run -p 8080:8080 lgym-page
```

Or via Docker Compose:

```bash
docker compose up --build
```

### GitHub Actions publishing to Docker Hub

The repository includes `.github/workflows/docker-image.yml` for building and publishing the production image to Docker Hub on every push to `main` and on manual dispatch.

Configure these GitHub repository settings before the workflow runs:

- **Secret**: `DOCKERHUB_TOKEN` — Docker Hub access token with push permissions,
- **Variable**: `DOCKERHUB_NAMESPACE` — Docker Hub namespace / organization,
- **Variable**: `DOCKERHUB_USERNAME` — Docker Hub login name (can match the namespace),
- **Variable**: `DOCKERHUB_IMAGE_NAME` — optional image name override; defaults to `lgym-page`,
- **Variable**: `VITE_API_BASE_URL` — production API base URL injected at image build time,
- **Variable**: `VITE_GOOGLE_CLIENT_ID` — optional Google client ID injected at image build time.

Published tags include:

- `latest`
- `sha-<short-commit>`

## 17. npm scripts

Defined scripts:

```json
{
  "dev": "vite",
  "build": "npm run typecheck && vite build",
  "preview": "vite preview",
  "typecheck": "vue-tsc --noEmit",
  "orval": "orval --config orval.config.ts"
}
```

## 18. Environment variables

Key environment variables visible in the repository:

### Frontend

- `VITE_API_BASE_URL` — backend API base URL, default: `https://localhost:7025`
- `VITE_GOOGLE_CLIENT_ID` — Google sign-in client ID

### API generation

- `ORVAL_SWAGGER_URL` — Swagger / OpenAPI endpoint used by Orval

Example `.env.local`:

```env
VITE_API_BASE_URL=https://localhost:7025
VITE_GOOGLE_CLIENT_ID=your-google-client-id
ORVAL_SWAGGER_URL=https://localhost:7025/swagger/v1/swagger.json
```

## 19. Project structure

```text
src/
├─ api/
│  ├─ generated/        # generated API client
│  ├─ model/            # DTOs and model types
│  └─ *.ts              # hand-written API wrappers
├─ components/          # UI and feature components
├─ composables/         # shared and domain logic
├─ layouts/             # admin / trainer / user layouts
├─ locales/             # PL / EN translations
├─ pages/               # route pages
├─ plugins/             # i18n, vuetify
├─ router/              # router setup and guards
└─ styles/              # Tailwind + CSS tokens
```

## 20. Quality and validation

The minimum validation standard for changes is:

- `npm run typecheck`
- `npm run build`

In practice, this verifies:

- TypeScript correctness,
- Vue component consistency,
- successful production build output.

## 21. Limitations and notes

- part of the API client is generated, while some integrations are maintained manually,
- the full business behavior depends on backend API contract compatibility,
- some business flows are inferred from routes, DTOs, and locale content, so this README documents the actual frontend repository state,
- the current UI mixes Vuetify components with Tailwind utility styling,
- production bundle size may require additional future code-splitting work.
