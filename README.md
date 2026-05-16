# PayChain — Decentralized Crypto Payroll Platform

> Pay your global team in stablecoins. Fast, transparent, borderless.

PayChain enables companies to onboard employees, assign salaries, and automate recurring crypto payments using Stellar blockchain rails.

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 15, TypeScript, Tailwind, Shadcn |
| Backend    | Node.js, Express, Prisma, PostgreSQL    |
| Blockchain | Stellar, Soroban smart contracts        |
| Auth       | JWT, bcrypt                             |
| Scheduling | node-cron                               |
| Charts     | Recharts                                |

## Project Structure

```
paychain/
├── apps/
│   ├── frontend/          # Next.js 15 app
│   └── backend/           # Express API
├── contracts/             # Soroban smart contracts (Rust)
└── package.json           # Monorepo root
```

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL
- Redis (optional for caching)

### 1. Clone & Install

```bash
git clone <repo>
cd paychain
npm install
```

### 2. Configure Environment

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edit DATABASE_URL, JWT_SECRET, STELLAR_ADMIN_SECRET

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
# Edit NEXT_PUBLIC_API_URL
```

### 3. Setup Database

```bash
cd apps/backend
npm run db:push       # Push schema to DB
npm run db:generate   # Generate Prisma client
```

### 4. Run Development

```bash
# From root
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
```

## API Endpoints

| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| POST   | /api/auth/register          | Register user         |
| POST   | /api/auth/login             | Login                 |
| GET    | /api/employees              | List employees        |
| POST   | /api/employees              | Add employee          |
| PUT    | /api/employees/:id          | Update employee       |
| DELETE | /api/employees/:id          | Remove employee       |
| GET    | /api/payroll                | List payrolls         |
| POST   | /api/payroll                | Create payroll        |
| POST   | /api/payroll/:id/execute    | Execute payment       |
| GET    | /api/analytics/overview     | Dashboard stats       |

## Supported Chains

- **Stellar** (primary) — USDC, USDT, XLM
- **Base** (planned)
- **Celo** (planned)

## Deployment

- **Frontend**: Vercel — `vercel deploy`
- **Backend**: Railway/Render — connect repo, set env vars
- **Database**: Supabase or Railway PostgreSQL

## License

MIT
