# AuraQuant

AuraQuant is a full-stack stock market dashboard built with Next.js. It features real-time market data, interactive TradingView charts, a personalized watchlist, and event-driven background jobs for notifications.

> Rebranded from the original **Signalist** template.

**Live demo:** https://quant-aura.vercel.app

---

## Features

- 📈 Real-time stock quotes, market overview, and sector heatmaps
- 🕯️ Interactive TradingView charts and widgets
- ⭐ Personal watchlist with add/remove functionality
- 🔔 Event-driven background jobs (via Inngest) for email notifications
- 🔐 User authentication and session management
- 📧 Automated email notifications (via Nodemailer)
- 🎨 Responsive UI built with Tailwind CSS and shadcn/ui

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 15.5.x](https://nextjs.org/) | Full-stack React framework (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [shadcn/ui](https://ui.shadcn.com/) | UI components |
| [Clerk](https://clerk.com/) | Authentication |
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Database |
| [Inngest](https://www.inngest.com/) | Event-driven background jobs |
| [Finnhub API](https://finnhub.io/) | Real-time stock market data |
| [TradingView Widgets](https://www.tradingview.com/widget/) | Stock charts and heatmaps |
| [Nodemailer](https://nodemailer.com/) | Email notifications |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |

> **Note:** This project currently uses **Clerk** for authentication. Some documentation and code comments may reference Better Auth from an earlier planned migration — Clerk is the authentication provider actually in use.

---

## Project Structure

```
your-app-name/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── layout.tsx
│   ├── (root)/
│   ├── api/
│   ├── favicon.ico
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── forms/
│   │   ├── CountrySelectField.tsx
│   │   ├── FooterLink.tsx
│   │   ├── InputField.tsx
│   │   └── SelectField.tsx
│   ├── ui/
│   ├── Header.tsx
│   ├── NavItems.tsx
│   ├── SearchCommand.tsx
│   ├── TradingViewWidget.tsx
│   ├── UserDropdown.tsx
│   └── WatchlistButton.tsx
├── hooks/
│   └── useTradingViewWidget.ts
├── lib/
│   ├── actions/
│   │   ├── auth.actions.ts
│   │   ├── finnhub.actions.ts
│   │   ├── user.actions.ts
│   │   └── watchlist.actions.ts
│   ├── inngest/
│   │   ├── client.ts
│   │   ├── functions.ts
│   │   └── prompts.ts
│   ├── nodemailer/
│   │   ├── index.ts
│   │   └── templates.ts
│   ├── auth-client.ts
│   ├── constants.ts
│   ├── mongodb.ts
│   ├── utils.ts
│   └── watchlist-context.tsx
├── declarations.d.ts
├── next.config.ts
├── tsconfig.json
└── .env
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB instance)
- A [Clerk](https://clerk.com/) account
- A [Finnhub](https://finnhub.io/) API key
- A [Google Gemini](https://ai.google.dev/) API key
- An email account for [Nodemailer](https://nodemailer.com/) (e.g. Gmail with an app password)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd your-app-name
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```dotenv
NODE_ENV='development'
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Finnhub
NEXT_PUBLIC_NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Gemini
GEMINI_API_KEY=your_gemini_key

# Nodemailer
NODEMAILER_EMAIL=your_email
NODEMAILER_PASSWORD=your_app_password

# Inngest
INNGEST_DEV=1
INNGEST_EVENT_KEY=local
INNGEST_SIGNING_KEY=local
```

> ⚠️ Never commit your `.env` file. Ensure it's listed in `.gitignore`.

### 4. Run the development server

Open **two terminals**:

```bash
# Terminal 1 — Next.js app
npm run dev
```

```bash
# Terminal 2 — Inngest dev server (background jobs)
npx inngest-cli@latest dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## License

This project is for personal/educational use unless otherwise specified.
