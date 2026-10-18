# Ahjoor Frontend

**Ahjoor** is a trustless community savings platform built with transparency in mind. This repository contains the Next.js frontend application, which provides real-time dashboards for savings groups to manage their circles, track contributions, and monitor payout status.

---

## Features

- **Savings Circles** — create and join rotating savings groups with configurable contribution amounts, durations, and privacy settings.
- **Dashboard** — real-time overview of all your active circles, upcoming contributions, and pending payouts.
- **Circle Detail** — per-circle view of round history, participant contributions, health score, and payout schedule.
- **Contributions Timeline** — chronological log of every contribution across all circles with on-time/late/missed status.
- **Payout History** — record of completed and pending payouts with on-chain transaction links.
- **Notifications** — real-time alerts for round completions, missed contributions, upcoming payouts, and invites.
- **Wallet Integration** — connect your Web3 wallet for identity and signing.
- **Calculator** — contribution and payout estimator before joining a circle.
- **Offline Support** — service worker caches the shell so the app loads without a network connection.
- **Themes** — light and dark mode, comfortable and compact table density.

---

## Screenshots

> Add screenshots of the landing page, dashboard and circle detail view here once the app is deployed.

| Landing | Dashboard | Circle Detail |
|---------|-----------|---------------|
| _coming soon_ | _coming soon_ | _coming soon_ |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_ADAPTER` | No | `mock` | Set to `http` to use the live HTTP adapter instead of mock data. |
| `NEXT_PUBLIC_API_URL` | When adapter is `http` | — | Base URL of the backend API, e.g. `https://api.ahjoor.xyz`. |

Create a `.env.local` file in the project root and add any variables you want to override:

```
NEXT_PUBLIC_API_ADAPTER=mock
NEXT_PUBLIC_API_URL=https://api.ahjoor.xyz
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+ (or npm / yarn)

### Installation

```bash
# Clone the repo
git clone https://github.com/ussyalfaks/ahjoorxmr-frontend.git
cd ahjoorxmr-frontend

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the Next.js development server with hot-reload. |
| `pnpm build` | Create a production build. |
| `pnpm start` | Start the production server (requires a prior `build`). |
| `pnpm lint` | Run ESLint across the project. |

---

## Project Structure

```
app/          Next.js App Router pages and layouts
components/   Shared UI components
  ui/         Primitive components (buttons, toasts, skeletons, …)
contexts/     React context providers (theme, wallet, …)
data/         Mock data files — replaced by the API client when a backend is live
hooks/        Custom React hooks including TanStack Query data-fetching hooks
lib/
  api/        Typed API client (client.ts, mockAdapter.ts, httpAdapter.ts)
  queryKeys.ts  Centralised TanStack Query key factory
types/        TypeScript interface definitions
public/       Static assets and service-worker entry point
```

---

## Contributing

We welcome contributors of all experience levels!

### Getting Started

- Look for **good first issues** on the [issues page](https://github.com/ussyalfaks/ahjoorxmr-frontend/issues).
- Fork the repository and create a feature branch from `dev`.
- Open a pull request against `dev`.
- [Figma Design](https://www.figma.com/design/NlDFuleGHbh26rRp1ZfyvE/Ahjoor-Design?node-id=0-1&t=3E08H8am5RpUngRF-1)

### Branching Strategy

- `main` — stable release branch
- `dev` — active development
- `feature/*` — individual features or fixes

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Purpose |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code changes with no feature/fix |
| `chore` | Maintenance tasks |

---

## Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query](https://tanstack.com/query/latest)
- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)

---

## License

This project is licensed under the **MIT License**.

---

## Contact

Have questions or feedback? Join us on [Telegram](https://t.me/ahjoor).
