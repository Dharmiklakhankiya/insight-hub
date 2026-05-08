# InsightHub

A full-stack, multi-tenant legal case management platform built with **Next.js 16**, **MongoDB**, and **MUI**. InsightHub helps law firms track cases, manage documents, and surface analytics insights — all behind a secure, role-based authentication system with tenant isolation.

---

## Features

- **Authentication** — JWT-based login/logout/register with HTTP-only cookies, CSRF protection, and rate limiting
- **Multi-tenant architecture** — Firms (tenants) are fully isolated; cross-tenant access is blocked at the API layer
- **Role-based access control** — Four roles: `super_admin`, `admin`, `lawyer`, and `clerk`
- **Case management** — Create, view, update, and delete cases with statuses (`ongoing`, `pending`, `closed`), assigned lawyers, court/judge details, filing dates, and a timestamped timeline of events
- **Document uploads** — Attach PDF, DOCX, PNG, or JPEG files (up to 10 MB) to cases, with tag-based organisation
- **Full-text search** — Search across case titles, client names, and case types
- **Analytics dashboard** — Live stats including total cases, active/closed counts, average case duration, and deterministic insights
- **User management** — Admins can create, update, delete, and reset passwords for users within their tenant
- **Tenant management** — Super admins can create, update, and delete tenants
- **Public landing page** — Marketing site with hero, features, pricing, workflow, security, and testimonials sections
- **Docker support** — One-command local MongoDB via Docker Compose

---

## Tech Stack

| Layer        | Technology                             |
| ------------ | -------------------------------------- |
| Framework    | Next.js 16 (App Router)                |
| Language     | TypeScript                             |
| UI           | MUI (Material UI) v9 + Tailwind CSS v4 |
| Database     | MongoDB via Mongoose                   |
| Auth         | JWT (`jsonwebtoken`) + `bcryptjs`      |
| Validation   | Zod                                    |
| File uploads | Multer                                 |
| HTTP client  | Axios                                  |
| Testing      | Vitest                                 |
| Formatting   | Prettier                               |

---

## Role Hierarchy

| Role          | Scope         | Can manage                         |
| ------------- | ------------- | ---------------------------------- |
| `super_admin` | Global        | All tenants, all users             |
| `admin`       | Tenant-scoped | `lawyer` and `clerk` in own tenant |
| `lawyer`      | Tenant-scoped | No user management                 |
| `clerk`       | Tenant-scoped | No user management                 |

---

## Project Structure

```
insight-hub/
├── app/
│   ├── page.tsx              # Public landing page
│   ├── privacy/              # Privacy policy page
│   ├── terms/                # Terms of service page
│   ├── (auth)/               # Login page (public)
│   ├── (protected)/          # Dashboard, cases, analytics, user & tenant management (auth required)
│   └── api/                  # API route handlers
│       ├── auth/             #   login, logout, me, register
│       ├── cases/            #   CRUD + document upload
│       ├── analytics/        #   Analytics summary
│       ├── search/           #   Full-text search
│       ├── users/            #   User management + password reset
│       ├── tenants/          #   Tenant management
│       └── csrf/             #   CSRF token
├── controllers/              # Business-logic controllers
├── services/                 # Data-access services
├── models/                   # Mongoose models (User, Case, Document, Tenant)
├── lib/                      # Shared utilities (auth, DB, CSRF, RBAC, rate-limit, validation, etc.)
├── components/               # Reusable React components
├── scripts/                  # Utility scripts (e.g. seed-super-admin)
├── diagrams/                 # Architecture and design diagrams
├── tests/                    # Unit and integration tests (Vitest)
├── docker-compose.yml        # Local MongoDB container
└── uploads/                  # Uploaded files (gitignored)
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (recommended) — or npm/yarn
- **MongoDB** — run locally or via Docker (see below)

### 1. Clone the repository

```bash
git clone https://github.com/Dharmiklakhankiya/insight-hub.git
cd insight-hub
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/insight_hub
JWT_SECRET=your_super_secret_key_at_least_32_chars
JWT_EXPIRES_IN=15m
APP_URL=http://localhost:3000
```

> ⚠️ **Never commit your `.env.local` file.** Use a strong, random `JWT_SECRET` in production.

### 4. Start MongoDB (Docker)

```bash
docker compose up -d
```

This starts a MongoDB 7 container on `localhost:27017` with a persistent `mongo_data` volume.

### 5. Seed the super admin

```bash
pnpm tsx scripts/seed-super-admin.ts
```

### 6. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `pnpm dev`              | Start the Next.js development server |
| `pnpm build`            | Build for production                 |
| `pnpm start`            | Start the production server          |
| `pnpm lint`             | Run ESLint                           |
| `pnpm format`           | Format code with Prettier            |
| `pnpm check`            | Check formatting with Prettier       |
| `pnpm test`             | Run all tests with Vitest            |
| `pnpm test:unit`        | Run unit tests only                  |
| `pnpm test:integration` | Run integration tests only           |
| `pnpm test:coverage`    | Run tests with coverage report       |

---

## API Endpoints

### Authentication

| Method | Path                 | Description                    |
| ------ | -------------------- | ------------------------------ |
| `POST` | `/api/auth/login`    | Log in and receive auth cookie |
| `POST` | `/api/auth/logout`   | Clear auth cookie              |
| `GET`  | `/api/auth/me`       | Get current authenticated user |
| `POST` | `/api/auth/register` | Register a new user            |
| `GET`  | `/api/csrf`          | Get CSRF token                 |

### Cases

| Method   | Path                        | Description                 |
| -------- | --------------------------- | --------------------------- |
| `GET`    | `/api/cases`                | List cases                  |
| `POST`   | `/api/cases`                | Create a new case           |
| `GET`    | `/api/cases/[id]`           | Get a single case           |
| `PATCH`  | `/api/cases/[id]`           | Update a case               |
| `DELETE` | `/api/cases/[id]`           | Delete a case               |
| `POST`   | `/api/cases/[id]/documents` | Upload a document to a case |

### Users

| Method   | Path                        | Description             |
| -------- | --------------------------- | ----------------------- |
| `GET`    | `/api/users`                | List users              |
| `POST`   | `/api/users`                | Create a user           |
| `PATCH`  | `/api/users/[userId]`       | Update a user           |
| `DELETE` | `/api/users/[userId]`       | Delete a user           |
| `POST`   | `/api/users/reset-password` | Reset a user's password |

### Tenants

| Method   | Path                      | Description     |
| -------- | ------------------------- | --------------- |
| `GET`    | `/api/tenants`            | List tenants    |
| `POST`   | `/api/tenants`            | Create a tenant |
| `PATCH`  | `/api/tenants/[tenantId]` | Update a tenant |
| `DELETE` | `/api/tenants/[tenantId]` | Delete a tenant |

### Other

| Method | Path             | Description                   |
| ------ | ---------------- | ----------------------------- |
| `GET`  | `/api/analytics` | Get analytics summary         |
| `GET`  | `/api/search`    | Full-text search across cases |

---

## Data Models

### User

| Field          | Type                                            | Notes             |
| -------------- | ----------------------------------------------- | ----------------- |
| `name`         | String                                          | 2–80 chars        |
| `email`        | String                                          | Unique, lowercase |
| `passwordHash` | String                                          | bcrypt hash       |
| `role`         | `super_admin` \| `admin` \| `lawyer` \| `clerk` | Default: `clerk`  |
| `tenantId`     | ObjectId                                        | Ref → Tenant      |

### Tenant

| Field  | Type   | Notes               |
| ------ | ------ | ------------------- |
| `name` | String | 2–120 chars, unique |

### Case

| Field              | Type                               | Notes                                          |
| ------------------ | ---------------------------------- | ---------------------------------------------- |
| `title`            | String                             | 3–140 chars                                    |
| `client_name`      | String                             | 3–120 chars                                    |
| `case_type`        | String                             | e.g. `Civil`, `Criminal`                       |
| `court`            | String                             | Court name                                     |
| `judge`            | String                             | Judge name                                     |
| `status`           | `ongoing` \| `pending` \| `closed` | —                                              |
| `assigned_lawyers` | String[]                           | At least one required                          |
| `filing_date`      | Date                               | —                                              |
| `closing_date`     | Date                               | Optional                                       |
| `timeline`         | TimelineEvent[]                    | `filing`, `hearing`, `adjournment`, `judgment` |
| `created_by`       | ObjectId                           | Ref → User                                     |

### Document

| Field           | Type     | Notes                 |
| --------------- | -------- | --------------------- |
| `case_id`       | ObjectId | Ref → Case            |
| `tags`          | String[] | At least one required |
| `file_path`     | String   | Server-side path      |
| `mime_type`     | String   | PDF, DOCX, PNG, JPEG  |
| `original_name` | String   | Original filename     |
| `uploaded_by`   | ObjectId | Ref → User            |

---

## Contributing

1. Fork the repository and create a feature branch.
2. Make your changes, add tests where applicable.
3. Ensure all tests pass: `pnpm test`
4. Submit a pull request with a clear description of your changes.

---

## License

This project is private. All rights reserved.
