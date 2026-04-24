# ⚡ Commate

### Find your real teammate. Verified by GitHub.

> **"Stop klaim skill. Buktikan dengan commit."**

[![TechSprint Innovation Cup 2026](https://img.shields.io/badge/TechSprint_Innovation_Cup-2026-7C3AED?style=for-the-badge)](https://codelab.id)
[![Team NPD](https://img.shields.io/badge/Team-NPD-4C1D95?style=for-the-badge)](https://github.com)
[![Live Demo](https://img.shields.io/badge/Live_Demo-commate.workers.dev-5B21B6?style=for-the-badge)](https://commate.workers.dev)

---

Commate adalah platform matchmaking tim developer yang memverifikasi keahlian secara otomatis lewat histori GitHub dan WakaTime — bukan dari klaim manual. Cukup login, biarkan AI yang profiling, dan temukan rekan tim yang benar-benar bisa bekerja.

```
Login GitHub  →  AI Skill Profiling  →  Semantic Match
  OAuth 2.0      GitHub 70% + WakaTime 30%   Top 3 Kandidat + Score %
```

---

## Tech Stack

| Layer    | Teknologi                       |
| -------- | ------------------------------- |
| Frontend | Next.js, Tailwind CSS           |
| Backend  | Hono on Cloudflare Workers      |
| ORM      | Drizzle ORM                     |
| AI       | Cloudflare Workers AI           |
| Database | Neon DB (PostgreSQL + pgvector) |
| Auth     | GitHub OAuth 2.0 + WakaTime API |
| Deploy   | Cloudflare Workers & Pages      |

---

## Local Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) >= 4.0
- Akun [Cloudflare](https://cloudflare.com) & [Neon DB](https://neon.tech)

### Setup

```bash
git clone https://github.com/HapisHanipudin/commate.git
cd commate
bun install
```

Buat file `.dev.vars` di `apps/api/` dan `apps/web/` berdasarkan `.dev.vars.example` di masing-masing folder.

```bash
wrangler login
bun run dev
```

- API → `http://localhost:8787`
- Web → `http://localhost:3000`

## Deployment Config (Pages + Worker)

Konfigurasi ini direkomendasikan untuk setup terpisah agar tRPC dari frontend ke API aman di production dan preview PR.

### 1) Frontend (`apps/web`) — Cloudflare Pages

- Root directory: `/` (repo root)
- Build command: `bun install --frozen-lockfile && cd apps/web && npx @cloudflare/next-on-pages@1`
- Build output directory: `apps/web/.vercel/output/static`
- Build comments: `Enabled` (agar PR dapat preview URL)
- Environment variable:
  - `NEXT_PUBLIC_API_URL=https://<worker-name>.<subdomain>.workers.dev`

Untuk preview branch/PR, gunakan `NEXT_PUBLIC_API_URL` yang menunjuk ke endpoint API yang bisa diakses publik.

### 2) API (`apps/api`) — Cloudflare Worker

- Root directory: `/` (repo root)
- Build command: `bun install --frozen-lockfile && cd apps/api && bun run build`
- Deploy command: `npx wrangler deploy --config apps/api/wrangler.jsonc`
- Version command: `npx wrangler versions upload --config apps/api/wrangler.jsonc`
- Variables/Secrets wajib:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `WAKATIME_CLIENT_ID`
  - `WAKATIME_CLIENT_SECRET`
  - `NEON_DATABASE_URL`
  - `JWT_SECRET`
  - `CORS_ORIGINS`

Contoh `CORS_ORIGINS`:

`http://localhost:3000,https://commate-web.pages.dev,https://*.commate-web.pages.dev`

`CORS_ORIGINS` mendukung wildcard `*.` untuk domain preview Pages.

### Database & Drizzle

Boilerplate Drizzle untuk API sudah aktif di `apps/api`.

```bash
cd apps/api
bun run db:generate   # generate migration dari schema
bun run db:migrate    # jalankan migration SQL ke database
bun run db:push       # sync schema langsung (dev cepat)
bun run db:studio     # buka drizzle studio
```

Pastikan `NEON_DATABASE_URL` sudah diisi di `.dev.vars` atau `.env` sebelum menjalankan command di atas.

---

## Tim

| Nama   | Role      |
| ------ | --------- |
| Apiz   | Developer |
| Dasril | Developer |
| Ahyan  | Developer |

**Team NPD** · TechSprint Innovation Cup 2026

---

<p align="center">
  <sub>Dibuat dengan ☕ dan masih sedikit commit oleh Team NPD · Commate 2026</sub>
</p>
