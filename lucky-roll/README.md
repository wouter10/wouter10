# 🎲 Lucky Roll

Een mobiele PWA waarmee je willekeurig kiest uit persoonlijke lijsten — films, restaurants, games, en alles wat je zelf bedenkt. Gooi de dobbelstenen en laat het lot beslissen.

**Features:**
- Geanimeerde dobbelstenen met confetti
- Categorieën en items beheren (inclusief bulk-import)
- Favorieten markeren
- Rolgeschiedenis (laatste 20)
- **AI Chat** — beheer je lijsten via natuurlijke taal ("voeg Oppenheimer toe aan Films")
- Dark/light mode, installeerbaar als PWA

**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase · Claude API

---

## Vereisten

- Node.js 18+
- Een [Supabase](https://supabase.com) project (gratis tier volstaat)
- Een [Anthropic](https://console.anthropic.com) API-sleutel (voor de AI Chat)

---

## 1. Supabase project opzetten

### 1a. Nieuw project aanmaken

1. Ga naar [supabase.com](https://supabase.com) en maak een nieuw project aan
2. Kies een regio dicht bij je gebruikers
3. Noteer je **Project URL** en **anon public key** (te vinden onder *Project Settings → API*)

### 1b. Database-migratie uitvoeren

Ga naar **SQL Editor** in je Supabase-dashboard en plak de inhoud van:

```
supabase/migrations/001_initial_schema.sql
```

Klik op **Run**. Dit maakt:
- Tabellen: `categories`, `items`, `history`
- Row Level Security policies (gebruikers zien alleen eigen data)
- Performance-indexen
- Een trigger die 8 standaard-categorieën aanmaakt bij elke nieuwe registratie

### 1c. Auth instellingen

Ga naar **Authentication → Providers** en zorg dat **Email** is ingeschakeld.

Optioneel (aanbevolen voor development): schakel **Confirm email** uit onder *Authentication → Email Templates → Confirm signup* zodat je direct kunt inloggen zonder e-mailbevestiging.

---

## 2. Lokaal draaien

### 2a. Repository klonen

```bash
git clone <jouw-fork>
cd lucky-roll
npm install
```

### 2b. Environment-variabelen instellen

```bash
cp .env.local.example .env.local
```

Open `.env.local` en vul in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jouwproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw_anon_key

ANTHROPIC_API_KEY=sk-ant-...
```

| Variabele | Waar te vinden |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |

### 2c. Development server starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Je wordt doorgestuurd naar de loginpagina. Maak een account aan — na registratie staan er automatisch 8 categorieën klaar.

> **Let op:** De service worker registreert alleen in productie (`NODE_ENV=production`). In development draait de app zonder offline-caching.

---

## 3. Deployen naar Vercel

### 3a. Project importeren

1. Push je code naar GitHub
2. Ga naar [vercel.com/new](https://vercel.com/new) en importeer je repository
3. Vercel detecteert Next.js automatisch — geen extra configuratie nodig

### 3b. Environment-variabelen toevoegen

In het Vercel-dashboard onder **Settings → Environment Variables**, voeg toe:

| Naam | Waarde | Omgeving |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | jouw Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | jouw anon key | Production, Preview, Development |
| `ANTHROPIC_API_KEY` | jouw Anthropic key | Production, Preview, Development |

### 3c. Supabase Site URL instellen

Nadat Vercel je app heeft gedeployd (je krijgt een URL zoals `lucky-roll-xyz.vercel.app`):

1. Ga naar Supabase → **Authentication → URL Configuration**
2. Stel **Site URL** in op je Vercel-domein: `https://lucky-roll-xyz.vercel.app`
3. Voeg toe aan **Redirect URLs**: `https://lucky-roll-xyz.vercel.app/**`

### 3d. Deploy

Klik op **Deploy** — Vercel bouwt en publiceert de app. Volgende deploys gaan automatisch bij elke push naar `main`.

---

## 4. PWA installeren

Op Android (Chrome): tik op het installeer-banner dat verschijnt, of gebruik *Menu → App installeren*.

Op iOS (Safari): tik op het deelicoon → *Zet op beginscherm*.

---

## AI Chat — model aanpassen

De chat gebruikt standaard `claude-opus-4-8`. Wil je goedkoper of sneller? Pas één regel aan in `lib/claude/client.ts`:

```ts
// Goedkoopste optie (snel genoeg voor CRUD):
export const CHAT_MODEL = "claude-haiku-4-5";

// Middenweg:
export const CHAT_MODEL = "claude-sonnet-4-6";
```

---

## Projectstructuur

```
lucky-roll/
├── app/
│   ├── (auth)/          # Login en registratie
│   ├── (app)/           # Beveiligde pagina's
│   │   ├── categories/  # Lijst- en itembeheer
│   │   ├── history/     # Rolgeschiedenis
│   │   └── chat/        # AI Chat
│   ├── api/             # Server-side routes
│   │   ├── categories/
│   │   ├── items/
│   │   ├── history/
│   │   └── chat/        # Claude agentic loop
│   └── page.tsx         # Roll-scherm (home)
├── components/
│   ├── ui/              # Button, Card, Sheet, BottomNav, …
│   ├── dice/            # DiceFace, AnimatedDice
│   └── pwa/             # ServiceWorkerRegister, InstallPrompt
├── lib/
│   ├── claude/          # Anthropic client, tools, executor
│   ├── supabase/        # Browser- en server-client
│   ├── hooks/           # useRoll, useTheme
│   └── utils/           # random, date
├── types/               # TypeScript interfaces
├── supabase/
│   └── migrations/      # SQL-schema
└── public/
    ├── sw.js            # Service worker
    ├── manifest.json    # PWA-manifest
    └── icons/           # App-iconen
```
