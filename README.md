# FairShare 💸

**Split expenses. Simplify life.**

FairShare is a modern, full-stack expense-splitting application inspired by Splitwise — built to help friends, roommates, and groups track shared expenses, settle balances, and stay on top of who owes whom, without the awkward math.

🔗 **Live Demo:** [your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)

---

## ✨ Features

- **Group & 1-on-1 Expense Tracking** — Create groups or split costs directly with individuals
- **Real-time Balances** — Instantly see who owes you and who you owe, powered by Convex's live-sync backend
- **AI-Powered Magic Import** — Describe an expense in plain English (e.g. *"Dinner at a steakhouse for $84 on July 4th"*) and let Gemini AI extract the amount, category, and date automatically
- **Smart Categorization** — Expenses are auto-tagged into categories like Food, Travel, Rent, Entertainment, and Utilities
- **One-Click Payment Reminders** — Nudge someone to settle up instantly via email, with built-in cooldown protection against spam
- **Automated Daily Reminders** — A scheduled background job emails users a daily summary of outstanding balances
- **Secure Authentication** — Full sign-up/sign-in flow via Clerk, including session management and protected routes
- **Settlement History** — Track completed settlements alongside active balances for full transparency

---

## 🛠️ Tech Stack

| Layer               | Technology                                  |
|---------------------|----------------------------------------------|
| Frontend            | Next.js (App Router), React, Tailwind CSS, shadcn/ui |
| Backend / Database  | Convex (real-time backend-as-a-service)     |
| Authentication      | Clerk                                       |
| Background Jobs     | Inngest (scheduled payment reminders)       |
| Transactional Email | Nodemailer (Gmail SMTP)                     |
| AI                  | Google Gemini API (expense extraction & categorization) |
| Deployment          | Vercel (frontend) + Convex Cloud (backend)  |

---

## 🏗️ Architecture Overview

FairShare uses a **dual-deployment architecture**:

- **Vercel** hosts the Next.js frontend and API routes (e.g. the Gemini-powered Magic Import endpoint)
- **Convex** independently hosts all backend functions (queries, mutations, actions) and the real-time database — deployed separately via `npx convex deploy`, decoupled from the frontend build pipeline

This means backend logic (like email-sending or balance calculations) can be updated and deployed instantly without waiting on a full Vercel rebuild.

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   Browser    │ <────> │  Vercel (Next.js) │ <────> │  Convex Cloud    │
│  (Client)    │        │  Frontend + API   │        │  DB + Functions  │
└─────────────┘        └──────────────────┘        └─────────────────┘
                                │                              │
                                ▼                              ▼
                          Gemini API                    Nodemailer (Gmail SMTP)
                                                          Inngest (cron jobs)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account
- A Google Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey))
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) enabled (for email sending)

### Installation

```bash
git clone https://github.com/your-username/fairshare.git
cd fairshare
npm install
```

### Environment Variables

Create a `.env` file in the root with:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_JWT_ISSUER_DOMAIN=https://your-instance.clerk.accounts.dev

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email (Nodemailer via Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
```

> **Note:** Convex-side variables (`CLERK_JWT_ISSUER_DOMAIN`, `EMAIL_USER`, `EMAIL_PASS`) must *also* be set separately in the Convex dashboard or via:
> ```bash
> npx convex env set EMAIL_USER your_email@gmail.com
> npx convex env set EMAIL_PASS your_app_password
> ```

### Run locally

```bash
npx convex dev      # starts Convex backend + generates types
npm run dev         # starts Next.js frontend
```

Visit `http://localhost:3000`.

---

## 📦 Deployment

1. **Convex:** `npx convex deploy` — deploys backend functions to production independently
2. **Vercel:** Push to your connected GitHub repo — Vercel auto-builds and deploys the frontend
3. Ensure all environment variables above are set in **both** Vercel's dashboard and Convex's production environment
4. Update Clerk's instance to production keys (`pk_live_` / `sk_live_`) before going live
5. Sync Inngest functions to your production URL for scheduled reminders to run correctly

---

## 📁 Project Structure

```
app/
  (auth)/                     # Sign-in / sign-up routes
  (main)/
    contacts/                 # Group creation & member management
    dashboard/                # User dashboard & balance overview
    expenses/new/              # Expense creation, including AI Magic Import
  api/
    parse-expense/             # Gemini AI expense-parsing endpoint
convex/
  schema.js                    # Database schema
  expenses.js, groups.js       # Core data queries/mutations
  reminders.js                 # One-click manual payment reminders
  inngest.js                   # Queries supporting scheduled reminder jobs
  email.js                     # Nodemailer email-sending action
components/                     # Shared UI components
lib/
  inngest/                      # Background job definitions
```

---

## ⚠️ Known Limitations

- Email sending uses Gmail SMTP, capped at ~500 emails/day — suitable for demo/personal use, not production scale
- No custom email domain configured; sender address is a personal Gmail account
- Manual reminder feature includes a 24-hour cooldown per user pair to prevent spam

---

## 🙋 About This Project

FairShare began as a guided build and has since been substantially rebranded, restructured, and extended — including a custom AI-powered expense import feature, a one-click reminder system with rate-limiting, and a fully independent production deployment pipeline across Convex and Vercel. Built as a hands-on portfolio project to demonstrate real-world full-stack architecture, third-party API integration, and debugging across a multi-service deployment.

---

## 📄 License

This project is for educational and portfolio purposes.
