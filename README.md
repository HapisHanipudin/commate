# ⚡ Commate

### Platform Matchmaking Tim Akademik Berbasis Proof-of-Work

> **"Stop klaim skill. Buktikan dengan GitHub."**  
> Temukan rekan tim yang benar-benar bisa bekerja — diverifikasi otomatis lewat data nyata, bukan CV lisan.

<br>

[![TechSprint Innovation Cup 2026](https://img.shields.io/badge/TechSprint_Innovation_Cup-2026-7C3AED?style=for-the-badge)](https://codelab.id)
[![Team NPD](https://img.shields.io/badge/Team-NPD-4C1D95?style=for-the-badge)](https://github.com)
[![Subtema](https://img.shields.io/badge/Subtema-Smart_Business_%26_Digital_Economy-5B21B6?style=for-the-badge)](https://github.com)

---

## 🧠 Tentang Proyek

Di dunia hackathon dan proyek kampus, **skill fraud itu nyata**. Orang klaim jago React, tapi commit-nya nol. Orang bilang bisa backend, tapi repo-nya kosong.

**Commate** hadir sebagai solusi: platform matchmaking berbasis **Proof-of-Work** yang memverifikasi keahlian developer secara otomatis dari histori GitHub dan WakaTime — tanpa bisa dimanipulasi.

### Bagaimana cara kerjanya?

```
Login GitHub  →  AI Profiling Otomatis  →  Semantic Match
     ↓                    ↓                       ↓
  OAuth 2.0        Skill Vector (pgvector)    Top 3 Kandidat
  Zero-Trust       GitHub 70% + WakaTime 30%  + Match Score %
```

---

## ✨ Fitur Utama

| Fitur                       | Deskripsi                                                           |
| --------------------------- | ------------------------------------------------------------------- |
| 🔐 **Zero-Trust Auth**      | Login wajib via GitHub OAuth — tidak ada input skill manual         |
| 🤖 **AI Skill Profiling**   | Cloudflare Workers AI generate vector embedding dari histori commit |
| ⏱️ **WakaTime Integration** | Coding hours dari repo private ikut diperhitungkan                  |
| 🔍 **Semantic Search**      | Cari tim pakai natural language — "butuh jago backend AWS"          |
| 📊 **Skill Radar Chart**    | Visualisasi keahlian developer secara objektif                      |
| 🎓 **Apprentice Mode**      | Developer zero-commit tetap bisa ditemukan untuk posisi junior      |

---

## 🛠️ Tech Stack

### Frontend

- **Next.js** (App Router) — SSR/SSG, routing, session
- **Tailwind CSS** — styling
- **Recharts** — Skill Radar Chart
- **@opennextjs/cloudflare** — adapter untuk deploy ke CF Workers

### Backend

- **Hono** on **Cloudflare Workers** — edge runtime API
- **Cloudflare Workers AI** — generate vector embeddings
- **GitHub OAuth 2.0** — zero-trust authentication
- **WakaTime API** — coding hours data

### Database & Infrastructure

- **Neon DB** (PostgreSQL + pgvector) — skill vector storage & semantic search
- **Cloudflare Workers** — deploy backend
- **Cloudflare Pages/Workers** — deploy frontend

---

## 📁 Struktur Proyek

```
commate/
├── apps/
│   ├── web/                  # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/          # App Router pages
│   │   │   └── components/
│   │   ├── next.config.ts
│   │   ├── open-next.config.ts
│   │   └── wrangler.jsonc
│   └── api/                  # Hono backend
│       ├── src/
│       │   └── index.ts
│       └── wrangler.jsonc
├── packages/
│   └── shared/               # Shared types & utils
├── package.json              # Bun workspaces root
└── README.md
```

---

## 🚀 Cara Setup & Menjalankan Proyek

### Prerequisites

Pastikan sudah terinstall:

- [Bun](https://bun.sh) >= 1.0
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) >= 4.0 — `bun add -g wrangler`
- Akun [Cloudflare](https://cloudflare.com) (gratis)
- Akun [Neon DB](https://neon.tech) (gratis)

### 1. Clone & Install

```bash
git clone https://github.com/vexpro/commate.git
cd commate
bun install
```

### 2. Setup Environment Variables

Buat file `.dev.vars` di masing-masing app:

**`apps/api/.dev.vars`**

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
WAKATIME_CLIENT_ID=your_wakatime_client_id
WAKATIME_CLIENT_SECRET=your_wakatime_client_secret
NEON_DATABASE_URL=postgresql://...
JWT_SECRET=your_random_secret_string
```

**`apps/web/.dev.vars`**

```
NEXT_PUBLIC_API_URL=http://localhost:8787
GITHUB_CLIENT_ID=your_github_client_id
NEXTAUTH_SECRET=your_random_secret_string
```

> **Cara dapat credentials:**
>
> - GitHub OAuth App → [github.com/settings/developers](https://github.com/settings/developers)  
>   Callback URL: `http://localhost:8787/auth/github/callback`
> - WakaTime OAuth App → [wakatime.com/apps](https://wakatime.com/apps)  
>   Redirect URI: `http://localhost:8787/auth/wakatime/callback`
> - Neon DB → [neon.tech](https://neon.tech) → buat project baru → copy connection string

### 3. Login ke Cloudflare

```bash
wrangler login
```

### 4. Jalankan Development Server

```bash
bun run dev
```

Ini akan menjalankan:

- 🟦 **API** → `http://localhost:8787`
- 🟪 **Web** → `http://localhost:3000`

---

## 🌐 Deploy ke Cloudflare

```bash
# Deploy API (Cloudflare Workers)
bun run deploy:api

# Deploy Frontend (Cloudflare Workers via OpenNext)
bun run deploy:web
```

> Setelah deploy, update `NEXT_PUBLIC_API_URL` di Cloudflare Dashboard ke URL Workers API production.

---

## 🗺️ Roadmap

### Sprint 1 — 14–27 April 2026

- [x] Project setup & monorepo
- [ ] GitHub OAuth flow
- [ ] WakaTime integration
- [ ] Landing Page
- [ ] Onboarding flow UI

### Sprint 2 — 28 April–11 Mei 2026

- [ ] Skill Vector generation (CF Workers AI + pgvector)
- [ ] Semantic search (cosine similarity)
- [ ] Dashboard Matchmaking UI
- [ ] Profile Page (Radar Chart)
- [ ] Edge cases & fallback logic

### Sprint 3 — 12–17 Mei 2026 _(Polish & Demo)_

- [ ] Bug fixing
- [ ] UX polish & animasi
- [ ] Seed data & demo prep
- [ ] Final submission

---

## 👥 Tim

| Nama   | Role      |
| ------ | --------- |
| Apiz   | Developer |
| Dasril | Developer |
| Ahyan  | Developer |

**Team Vexpro** — TechSprint Innovation Cup 2026  
Subtema: _Smart Business & Digital Economy_

---

## 📄 Lisensi

MIT License — lihat [LICENSE](LICENSE) untuk detail.

---

<p align="center">
  <sub>Dibuat dengan ☕ dan terlalu banyak commit oleh Team Vexpro · Commate 2026</sub>
</p>
