# FairShare 💸
### Split expenses. Simplify life.

FairShare is a modern, full-stack expense-splitting application inspired by Splitwise — built to help friends, roommates, and groups track shared expenses, settle balances, and stay on top of who owes whom, without the awkward math.

🔗 **Live Demo:** your-vercel-url.vercel.app

---

## ✨ Features

- **Group & 1-on-1 Expense Tracking** — Create groups or split costs directly with individuals
- **Real-time Balances** — Instantly see who owes you and who you owe, synced live via Supabase Realtime
- **AI-Powered Magic Import** — Describe an expense in plain English (e.g. *"Dinner at a steakhouse for $84 on July 4th"*) and let Gemini AI extract the amount, category, and date automatically
- **Smart Categorization** — Expenses are auto-tagged into categories like Food, Travel, Rent, Entertainment, and Utilities
- **O(1) Balance Calculation** — A pre-computed `group_balances` table keeps balance reads instant, even as expense history grows into the thousands
- **Atomic, ACID-Compliant Transactions** — Every expense creation, split, and balance update runs inside a single Prisma transaction — all-or-nothing, no partial writes
- **Race-Condition-Safe Settlements** — Row-level locking (`SELECT ... FOR UPDATE`) guarantees correct balances even when two users settle at the same instant
- **Automated Daily Reminders** — A scheduled Inngest job emails users a daily summary of outstanding balances, rate-limited and auto-retried
- **Secure Authentication** — Full sign-up/sign-in flow via Clerk, including session management and protected routes
- **Settlement History** — Track completed settlements alongside active balances for full transparency
- **Zero Orphan Records** — Cascading foreign keys clean up related data automatically when a group or expense is deleted

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, Tailwind CSS, shadcn/ui |
| Database | PostgreSQL (hosted on Neon) |
| ORM | Prisma |
| Authentication | Clerk |
| Real-time Sync | Supabase Realtime |
| Background Jobs | Inngest (scheduled payment reminders) |
| Transactional Email | Nodemailer (Gmail SMTP) |
| AI | Google Gemini API (expense extraction & categorization) |
| Deployment | Vercel |

---

## 🏗️ Architecture Overview

FairShare runs as a single Next.js application backed by a PostgreSQL database, with a few specialized services handling AI parsing, real-time sync, and background jobs.

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Browser   │ <──> │  Vercel (Next.js) │ <──> │ PostgreSQL (Neon)│
│  (Client)   │      │  Frontend + API   │      │  via Prisma ORM  │
└─────────────┘      └──────────────────┘      └─────────────────┘
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
         Gemini API     Nodemailer      Inngest (cron)
     (Magic Import)   (Gmail SMTP)   (daily reminders)
                              │
                              ▼
                    Supabase Realtime
                  (live balance updates)
```

All application logic — API routes, database access, and background job triggers — lives inside the one Next.js project. Prisma manages schema migrations and type-safe queries against Postgres; Supabase Realtime listens for database changes and pushes them to connected clients.

---

## 📊 Database Schema

FairShare's data model has 8 tables, all connected through foreign keys with `ON DELETE CASCADE` to guarantee referential integrity:

```
users ──────────────────────────────┐
  │                                 │
  ├── groups (created_by)           │
  │     │                           │
  │     ├── group_members ──────────┤
  │     ├── expenses ───────────────┤
  │     │     └── splits ───────────┤
  │     ├── settlements ────────────┤
  │     ├── group_balances ─────────┤
  │     └── reminder_logs ──────────┘
```

| Table | Purpose |
|---|---|
| `users` | Mirrors Clerk-authenticated users |
| `groups` | Expense-splitting groups |
| `group_members` | Group membership (many-to-many) |
| `expenses` | Individual expense records |
| `splits` | Each member's share of an expense |
| `settlements` | Completed payments between users |
| `group_balances` | Pre-computed net balances per user pair (O(1) reads) |
| `reminder_logs` | Audit trail of sent payment reminders |

Full schema (with types and constraints) lives in [`prisma/schema.prisma`](./prisma/schema.prisma).

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (or any Postgres instance)
- A [Clerk](https://clerk.com) account
- A [Google Gemini API key](https://aistudio.google.com/)
- A [Supabase](https://supabase.com) project (for Realtime)
- A Gmail account with an App Password enabled (for email sending)

### Installation

```bash
git clone https://github.com/your-username/fairshare.git
cd fairshare
npm install
```

### Environment Variables

Create a `.env` file in the root with:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase Realtime
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email (Nodemailer via Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### Set Up the Database

```bash
npx prisma migrate dev --name init   # creates tables from schema.prisma
npx prisma generate                  # generates the type-safe Prisma client
```

### Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 📦 Deployment

1. Push your Postgres schema to production: `npx prisma migrate deploy`
2. Push to your connected GitHub repo — Vercel auto-builds and deploys the app
3. Set all environment variables above in Vercel's dashboard
4. Update Clerk's instance to production keys (`pk_live_` / `sk_live_`) before going live
5. Point your Inngest app to the production URL so scheduled reminders run correctly
6. Enable Realtime on the relevant Supabase tables/publications

---

## 📁 Project Structure

```
app/
  (auth)/                  # Sign-in / sign-up routes
  (main)/
    contacts/              # Group creation & member management
    dashboard/             # User dashboard & balance overview
    expenses/new/          # Expense creation, including AI Magic Import
  api/
    parse-expense/         # Gemini AI expense-parsing endpoint
    inngest/                # Inngest webhook/route handler
prisma/
  schema.prisma            # Full database schema (8 tables)
  migrations/               # Version-controlled schema history
lib/
  db.js                     # Prisma client singleton
  balances.js               # O(1) balance read/write helpers
  inngest/                  # Background job definitions
  email.js                  # Nodemailer email-sending logic
  supabase.js                # Supabase Realtime client setup
components/                 # Shared UI components
```

---

## ⚡ Performance & Reliability Highlights

- **O(1) balance reads** via a dedicated `group_balances` table, updated atomically on every expense or settlement — no recalculating from full expense history
- **No N+1 queries** — related data (splits, users) is fetched via Prisma's `include`, turning what would be N+1 queries into a single JOIN
- **Row-level locking** (`SELECT ... FOR UPDATE`) prevents race conditions when multiple users settle balances concurrently
- **Cascading deletes** guarantee zero orphan records across all 8 tables when a group or expense is removed

---

## ⚠️ Known Limitations

- Email sending uses Gmail SMTP, capped at ~500 emails/day — suitable for demo/personal use, not production scale
- No custom email domain configured; sender address is a personal Gmail account
- Daily reminder job is rate-limited to 10 emails/sec to avoid provider throttling

---

## 🙋 About This Project

FairShare began as a guided build and has since been substantially rebranded, restructured, and extended — migrating from a NoSQL backend-as-a-service to a fully relational PostgreSQL + Prisma architecture with ACID-compliant transactions, row-level locking, and a pre-computed balance table for constant-time reads. It also includes a custom AI-powered expense import feature and a rate-limited, auto-retrying reminder system. Built as a hands-on portfolio project to demonstrate real-world full-stack architecture, relational database design, and third-party API integration.

---

## 📄 License

This project is for educational and portfolio purposes.