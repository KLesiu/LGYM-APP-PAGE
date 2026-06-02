# LGYM APP PAGE

> Frontend platform for gym/training operations with dedicated workspaces for **athletes**, **trainers**, and **administrators**.

---

## Spis treści / Table of contents

- [PL — README](#pl--readme)
  - [1. Czym jest projekt](#1-czym-jest-projekt)
  - [2. Cele biznesowe](#2-cele-biznesowe)
  - [3. Role użytkowników](#3-role-użytkowników)
  - [4. Najważniejsze funkcje aplikacji](#4-najważniejsze-funkcje-aplikacji)
  - [5. Założenia produktowe i techniczne](#5-założenia-produktowe-i-techniczne)
  - [6. Tech stack](#6-tech-stack)
  - [7. Architektura techniczna](#7-architektura-techniczna)
  - [8. Routing i obszary aplikacji](#8-routing-i-obszary-aplikacji)
  - [9. API i integracje](#9-api-i-integracje)
  - [10. Uwierzytelnianie i autoryzacja](#10-uwierzytelnianie-i-autoryzacja)
  - [11. Internacjonalizacja](#11-internacjonalizacja)
  - [12. Uruchomienie projektu lokalnie](#12-uruchomienie-projektu-lokalnie)
  - [13. Skrypty npm](#13-skrypty-npm)
  - [14. Zmienne środowiskowe](#14-zmienne-środowiskowe)
  - [15. Struktura projektu](#15-struktura-projektu)
  - [16. Jakość i walidacja](#16-jakość-i-walidacja)
  - [17. Ograniczenia i uwagi](#17-ograniczenia-i-uwagi)
- [EN — README](#en--readme)
  - [1. What this project is](#1-what-this-project-is)
  - [2. Business goals](#2-business-goals)
  - [3. User roles](#3-user-roles)
  - [4. Core application features](#4-core-application-features)
  - [5. Product and technical assumptions](#5-product-and-technical-assumptions)
  - [6. Tech stack](#6-tech-stack-1)
  - [7. Technical architecture](#7-technical-architecture)
  - [8. Routing and application areas](#8-routing-and-application-areas)
  - [9. API and integrations](#9-api-and-integrations)
  - [10. Authentication and authorization](#10-authentication-and-authorization)
  - [11. Internationalization](#11-internationalization)
  - [12. Running the project locally](#12-running-the-project-locally)
  - [13. npm scripts](#13-npm-scripts)
  - [14. Environment variables](#14-environment-variables)
  - [15. Project structure](#15-project-structure)
  - [16. Quality and validation](#16-quality-and-validation)
  - [17. Limitations and notes](#17-limitations-and-notes)

---

# PL — README

## 1. Czym jest projekt

LGYM APP PAGE to frontend aplikacji webowej do obsługi procesów związanych z treningiem, relacją trener–podopieczny oraz administracją platformą.

Projekt dostarcza trzy główne przestrzenie robocze:

- **Strefa zawodnika / athlete** — zarządzanie relacją z trenerem i dostęp do biblioteki ćwiczeń,
- **Strefa trenera / trainer** — zarządzanie podopiecznymi, planami treningowymi, raportami, zaproszeniami i ustawieniami,
- **Strefa administratora / admin** — zarządzanie użytkownikami, rolami, konfiguracją wersji aplikacji i biblioteką ćwiczeń.

Jest to aplikacja typu SPA oparta o Vue 3, TypeScript i Vite, z routingiem po stronie klienta, integracją z backend API i wielojęzycznym interfejsem.

## 2. Cele biznesowe

Projekt realizuje kilka celów biznesowych:

- centralizacja współpracy między trenerem a podopiecznym,
- uproszczenie zarządzania planami treningowymi i ich dniami,
- umożliwienie pracy na wspólnej bibliotece ćwiczeń,
- obsługa zaproszeń i relacji trener–zawodnik,
- zbieranie i przeglądanie raportów od podopiecznych,
- zapewnienie panelu administracyjnego do kontroli użytkowników i konfiguracji platformy,
- wsparcie dla różnych ról biznesowych w jednej aplikacji.

## 3. Role użytkowników

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

## 4. Najważniejsze funkcje aplikacji

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

## 5. Założenia produktowe i techniczne

Na podstawie kodu repozytorium można przyjąć następujące założenia:

- aplikacja jest frontendem współpracującym z zewnętrznym backend API,
- role biznesowe są rozdzielone na poziomie routingu i logiki dostępu,
- sesja użytkownika jest utrzymywana po stronie klienta w `localStorage`,
- backend zwraca JWT oraz informacje o rolach i claimach uprawnień,
- API dla większości zasobów jest typowane i częściowo generowane z OpenAPI,
- interfejs jest dostępny minimum w dwóch językach: polskim i angielskim,
- aplikacja jest przygotowana do obsługi działań idempotentnych po stronie API,
- frontend działa jako SPA i zakłada nowoczesne środowisko przeglądarkowe.

## 6. Tech stack

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

## 7. Architektura techniczna

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

## 8. Routing i obszary aplikacji

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

## 9. API i integracje

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

## 10. Uwierzytelnianie i autoryzacja

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

## 11. Internacjonalizacja

Aplikacja wspiera dwa języki:

- `pl` — domyślny,
- `en` — fallback.

Tłumaczenia znajdują się w:

- `src/locales/pl.json`
- `src/locales/en.json`

Lokalizacja wpływa nie tylko na UI, ale również na nagłówek `Accept-Language` wysyłany do API.

## 12. Uruchomienie projektu lokalnie

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

## 13. Skrypty npm

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

## 14. Zmienne środowiskowe

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

## 15. Struktura projektu

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

## 16. Jakość i walidacja

Minimalny standard walidacji zmian w projekcie:

- `npm run typecheck`
- `npm run build`

W praktyce oznacza to:

- kontrolę typów TypeScript,
- weryfikację spójności komponentów Vue,
- sprawdzenie, czy aplikacja buduje się produkcyjnie.

## 17. Ograniczenia i uwagi

- część klienta API jest generowana, a część utrzymywana ręcznie,
- pełny zakres funkcjonalny zależy od zgodności kontraktu backend API,
- część procesów biznesowych jest widoczna głównie przez routing, DTO i tłumaczenia, więc README opisuje realny stan frontendowego repozytorium,
- aktualnie aplikacja łączy podejście komponentowe Vuetify z utility-first stylingiem Tailwind,
- rozmiar produkcyjnych bundle’i może wymagać dalszego code-splittingu w przyszłości.

---

# EN — README

## 1. What this project is

LGYM APP PAGE is the frontend of a web platform used to manage training-related workflows, trainer–athlete relationships, and platform administration.

The product exposes three main workspaces:

- **Athlete area** — trainer relationship handling and exercise library access,
- **Trainer area** — trainee management, training plans, reports, invitations, exercises, and account settings,
- **Admin area** — user management, roles, app version configuration, and exercise administration.

It is a Vue 3 + TypeScript single-page application that communicates with a backend API and supports bilingual UI content.

## 2. Business goals

The application supports several business goals:

- centralize collaboration between trainers and athletes,
- simplify training plan management,
- provide a shared exercise library,
- support invitation-based trainer–athlete relationship management,
- collect and review athlete reports,
- expose an administration panel for platform control,
- support multiple business roles inside one product.

## 3. User roles

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

## 4. Core application features

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

## 5. Product and technical assumptions

Based on the repository code, the following assumptions are valid:

- the application is a frontend for an external backend API,
- business roles are separated at the routing and access-control layer,
- the user session is stored in `localStorage`,
- the backend returns JWT tokens, roles, and permission claims,
- most API communication is typed and partly generated from OpenAPI,
- the UI supports at least Polish and English,
- API requests are designed with idempotency support in mind,
- the frontend is built as a modern SPA.

## 6. Tech stack

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

## 7. Technical architecture

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

## 8. Routing and application areas

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

## 9. API and integrations

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

## 10. Authentication and authorization

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

## 11. Internationalization

The app supports two languages:

- `pl` — default,
- `en` — fallback.

Translation files live in:

- `src/locales/pl.json`
- `src/locales/en.json`

Locale selection affects both the UI and the `Accept-Language` header sent to the API.

## 12. Running the project locally

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

## 13. npm scripts

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

## 14. Environment variables

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

## 15. Project structure

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

## 16. Quality and validation

The minimum validation standard for changes is:

- `npm run typecheck`
- `npm run build`

In practice, this verifies:

- TypeScript correctness,
- Vue component consistency,
- successful production build output.

## 17. Limitations and notes

- part of the API client is generated, while some integrations are maintained manually,
- the full business behavior depends on backend API contract compatibility,
- some business flows are inferred from routes, DTOs, and locale content, so this README documents the actual frontend repository state,
- the current UI mixes Vuetify components with Tailwind utility styling,
- production bundle size may require additional future code-splitting work.
