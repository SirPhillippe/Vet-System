# Pawfect Care — Veterinary Clinic Management System

A full‑stack veterinary clinic management system. It provides a public website for booking
appointments, contacting the clinic and subscribing to a newsletter, plus authenticated
dashboards for **admins** and **vets** to manage appointments, services, medical records,
inventory, employees and payments.

- **Backend:** Node.js + Express + MySQL (`mysql2`)
- **Frontend:** Static HTML / CSS / vanilla JS with Bootstrap (served by Express, also a PWA)
- **Auth:** JWT
- **Integrations (optional):** Stripe payments, email via Nodemailer (Gmail) / SMTP, PDF receipts (`pdfkit`)

---

## Features

- Public appointment booking, contact/query form and newsletter signup
- JWT authentication for admin and vet roles
- Admin dashboard: appointments, services, employees, queries, payments
- Vet dashboard: appointments, medical records, patients, inventory
- Email notifications and PDF appointment receipts
- Optional Stripe payment flow

---

## Prerequisites

Install these before you start:

| Requirement | Notes |
|-------------|-------|
| [Node.js](https://nodejs.org/) | v18+ recommended (developed/tested on v24) |
| npm | Ships with Node.js |
| [MySQL](https://dev.mysql.com/downloads/) | A running MySQL server (v8 recommended) |

---

## Installation

### 1. Get the code

```bash
git clone <your-repo-url>
cd "Vet System"
```

### 2. Install dependencies

All dependencies live in the root `package.json`, so a single install covers backend and tooling:

```bash
npm install
```

### 3. Configure environment variables

Copy the provided template and edit the values:

```bash
cp backend/.env.example backend/.env
```

The minimum required values are the database connection and the JWT secret. The full template
looks like this:

```env
# Server
PORT=5000
NODE_ENV=development

# Auth
JWT_SECRET=replace-with-a-long-random-secret

# Database (MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=vet_management

# Email — Gmail / Nodemailer (optional, needed for notification emails)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
APP_BASE_URL=http://localhost:5000

# Email — SMTP alternative (optional, used by utils/email.js)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Pawfect Care <no-reply@example.com>"

# Stripe payments (optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

> **Security note:** `backend/.env` contains secrets and should never be committed. Use your
> own values — for `EMAIL_APP_PASSWORD` use a Gmail **App Password**, not your account password.

### 4. Create and initialize the database

Make sure MySQL is running, then run the single setup command **from the project root**:

```bash
npm run db:setup
```

This one command does everything:

- Creates the `vet_management` database if it doesn't exist
- Applies the complete schema in [backend/config/schema.sql](backend/config/schema.sql) —
  **all** tables the app uses (users, services, appointments, medical records, inventory,
  settings, employees, clients, pets, queries, newsletter, activity & audit logs)
- Seeds baseline data: the four standard services, clinic settings, sample inventory, and the
  **default admin & vet login accounts** (passwords are hashed at seed time)

It is safe to re-run — it drops and recreates the tables for a clean database each time.

> **Single source of truth:** the schema lives in `backend/config/schema.sql` and is the only
> setup you need. The numbered files in `backend/migrations/` are **legacy** and are already
> folded into this schema — `npm run db:setup` records them as applied, so you never need to
> run `scripts/run-migrations.js` on a database created this way.

### 5. Start the server

**Start the server in two steps — first `cd` into the `backend` folder, then run `node server.js`:**

```bash
cd backend
node server.js
```

Alternatively, run from the project root with the npm scripts:

```bash
# Production-style
npm start

# Development (auto-reload via nodemon)
npm run dev
```

The server starts on `http://localhost:5000` (it auto-tries the next port if 5000 is busy).

### 6. Open the app

The Express server serves the frontend as static files:

- **Public site:** http://localhost:5000/frontend/index.html
- **Login:** http://localhost:5000/frontend/pages/login.html

The frontend talks to the API at `http://localhost:5000/api`, configured in
[frontend/assets/js/config.js](frontend/assets/js/config.js). If you change the backend host
or port, update `window.API_BASE_URL` there.

---

## Default login credentials

Seeded by `npm run db:setup`:

| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | `admin@vettech.com` | `admin123` |
| Vet   | `vet@vettech.com`   | `vet123`   |

> Change these immediately for any non-local deployment.

---

## npm scripts

| Command          | What it does                                   |
|------------------|------------------------------------------------|
| `npm run db:setup` | Create the database, schema and seed data    |
| `npm start`      | Start the server (`node backend/server.js`)    |
| `npm run dev`    | Start with auto-reload (`nodemon`)             |
| `npm run lint`   | Run ESLint                                      |
| `npm run format` | Format code with Prettier                       |

## Useful helper scripts

Run from the project root (all read `backend/.env`):

| Script                                  | Purpose                                       |
|-----------------------------------------|-----------------------------------------------|
| `npm run db:setup`                      | **Canonical setup** — create DB, schema, seed |
| `node backend/scripts/create-admin.js`  | Add an extra admin user                       |
| `node backend/scripts/reset-admin.js`   | Reset the admin account                       |
| `node backend/scripts/list-users.js`    | List users in the database                    |
| `node backend/scripts/checkEnv.js`      | Verify email environment variables            |

> The `backend/migrations/` folder and `backend/scripts/init-db.js` are legacy and superseded
> by `npm run db:setup`. You don't need them for a fresh install.

---

## Project structure

```
Vet System/
├── package.json            # Dependencies + scripts (run from here)
├── backend/
│   ├── server.js           # App entry point (npm start)
│   ├── app.js              # Express app, middleware, route mounting
│   ├── .env                # Environment variables (create this)
│   ├── config/             # DB connection, schema.sql, init_db.js, seed
│   ├── controllers/        # Route handlers
│   ├── routes/             # API route definitions (/api/...)
│   ├── middlewares/        # Auth, etc.
│   ├── models/             # Data models
│   ├── migrations/         # Numbered SQL migrations
│   ├── scripts/            # Setup/maintenance/check scripts
│   └── utils/              # Email service, PDF, helpers
└── frontend/
    ├── index.html          # Public landing page
    ├── pages/              # login, book-appointment, dashboards
    ├── assets/js/config.js # API base URL configuration
    ├── manifest.json, sw.js# PWA support
    └── ...                 # CSS, JS, Bootstrap, images
```

---

## Troubleshooting

- **`Database connection failed` on startup** — confirm MySQL is running and the `DB_*` values
  in `backend/.env` are correct, then re-run `npm run db:setup`.
- **Port 5000 in use** — the server automatically tries the next available port; check the
  console output for the actual port, or set `PORT` in `backend/.env`.
- **Want a clean slate** — re-run `npm run db:setup`; it drops and recreates every table and
  re-seeds the default accounts.
- **Emails not sending** — these features are optional; set the `EMAIL_*` / `SMTP_*` variables.
  Use `node backend/scripts/checkEnv.js` to verify them.
