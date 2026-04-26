# Zealthy – Mini-EMR & Patient Portal

A full-stack healthcare application with a provider-facing EMR admin panel and a patient-facing portal.

## Tech Stack

- **Frontend:** React 18, React Router v6, Tailwind CSS, Vite, date-fns, Lucide icons
- **Backend:** Node.js, Express, better-sqlite3, bcryptjs, JWT auth
- **Database:** SQLite (file-based, zero-config)

## Architecture Decisions

- **SQLite** chosen for simplicity and zero-config deployment. For production, swap to PostgreSQL via a simple adapter.
- **JWT-based auth** for the patient portal — stateless, no session store needed.
- **Admin panel has no auth** per the exercise specification.
- **Recurring events** are computed client-side from a base date + repeat schedule, rather than materializing every occurrence in the DB. This keeps the data model clean and makes schedule changes instant.
- **Separation of concerns:** Admin API routes are fully independent from portal routes. Admin operates on any user; portal routes are scoped to the authenticated user via JWT.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install all dependencies
npm run install:all

# Seed the database with sample data
npm run seed

# Start development servers (API + React dev server)
npm run dev
```

The React dev server runs on **http://localhost:5173** with API proxied to port 4000.

### URLs

| Route | Description |
|-------|-------------|
| `/` | Patient Portal login |
| `/portal` | Patient dashboard (authenticated) |
| `/portal/appointments` | Full appointment schedule (3 months) |
| `/portal/prescriptions` | All prescriptions with refill dates |
| `/admin` | EMR admin – patient list |
| `/admin/patients/:id` | Patient detail with CRUD |

### Demo Credentials

| Email | Password |
|-------|----------|
| `mark@some-email-provider.net` | `Password123!` |
| `lisa@some-email-provider.net` | `Password123!` |

## Production Build

```bash
npm run build        # Builds React client
npm start            # Starts Express serving the built client + API
```

## Features

### EMR Admin (`/admin`)
- Patient list with at-a-glance appointment and prescription counts
- Search/filter patients
- Create new patients (with password for portal login)
- Edit patient info
- Full CRUD on appointments: provider, datetime, repeat schedule, end date
- Full CRUD on prescriptions: medication (from seed list), dosage, quantity, refill date/schedule
- Cancel/reactivate appointments
- Activate/deactivate prescriptions

### Patient Portal (`/`)
- Secure login with email/password
- Dashboard: appointments within 7 days, refills within 7 days, patient info summary
- Appointments drill-down: all upcoming occurrences for 3 months, grouped by month
- Prescriptions drill-down: all active meds with computed refill dates for 3 months

## Project Structure

```
zealthy-emr/
├── server/
│   ├── index.js            # Express entry
│   ├── db.js               # SQLite schema + connection
│   ├── seed.js             # Database seeder
│   ├── middleware/auth.js   # JWT middleware
│   └── routes/
│       ├── auth.js         # Login endpoint
│       ├── admin.js        # EMR admin CRUD
│       └── portal.js       # Patient portal (authenticated)
├── client/
│   ├── src/
│   │   ├── App.jsx         # Router + route guards
│   │   ├── context/        # Auth context
│   │   ├── utils/          # API client, date helpers
│   │   ├── components/     # Shared UI components
│   │   └── pages/          # All page components
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── package.json            # Root scripts
```
