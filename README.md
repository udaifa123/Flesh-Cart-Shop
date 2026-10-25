# FreshCart – Shop Web App

A small web app for a neighbourhood grocery shop: public landing page, staff sign up / login / logout, a protected dashboard, and a POS billing screen with a cart, printable bills and bill history.

## Stack and why

| Part | Choice | Why |
|---|---|---|
| Frontend | React + Vite, React Router | Fast to build; simple SPA with route guards |
| Backend | Node.js + Express | Small, easy to read and explain |
| Database | PostgreSQL (`pg` driver, plain SQL) | Real relational DB; transactions and row locks for billing |
| Auth | bcrypt (`bcryptjs`) password hashes + signed JWT in an **httpOnly cookie** | Token is not readable by JavaScript; server checks it on every protected request |

## Run it locally (Windows)

### 0. Prerequisites (install once)
* Node.js 18+ (LTS) – https://nodejs.org
* PostgreSQL 14+ – https://www.postgresql.org/download/windows/  (remember the password you set for the `postgres` user; keep port 5432)
* Git

Check them in **Command Prompt** or **PowerShell**:
```
node -v
npm -v
```

### 1. Install dependencies
From the project folder (the one containing this README):
```
cd freshcart
npm run install:all
```
(If `npm run install:all` is not available yet, run `npm install` first. It installs the root, `server` and `client` packages.)

### 2. Configure environment
Command Prompt:
```
copy server\.env.example server\.env
notepad server\.env
```
PowerShell:
```
Copy-Item server\.env.example server\.env
notepad server\.env
```
Edit these values and save:
* `DATABASE_URL=postgresql://postgres:YOUR_PG_PASSWORD@localhost:5432/freshcart` – put your real `postgres` password in. If it contains special characters such as `@` or `#`, URL-encode them (`@` → `%40`, `#` → `%23`).
* `JWT_SECRET=` – any long random string. Generate one with:
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 3. Create the database, tables and sample data
```
npm run db:setup
```
This creates the `freshcart` database if it does not exist, creates the tables, inserts 10 sample products and creates the admin user. It is safe to run again.

**Alternative: using psql directly** (psql is in `C:\Program Files\PostgreSQL\<version>\bin`):
```
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE freshcart;"
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d freshcart -f server\sql\schema.sql
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d freshcart -f server\sql\seed.sql
```
(Then run `npm run db:setup` once more only if you want the admin user created.)

### 4. Start the app (development)
```
npm run dev
```
* Frontend: http://localhost:5173  ← open this one
* API: http://localhost:5000

### Optional: single-server "production" mode
```
npm run build
npm start
```
Open http://localhost:5000 (Express serves the built React app and the API together). For HTTPS hosting set `COOKIE_SECURE=true`.

### Logins
* **Staff**: use the Sign up page.
* **Admin** (created by `db:setup`): `admin@freshcart.com` / `Admin@12345` (change via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server\.env` *before* running `db:setup`).

## Features

### Required
- [x] **Landing page** – navbar (shop name, Login, Sign up), hero with tagline and "Shop now", product cards (name, ₹ price, emoji placeholder), footer with address and phone, mobile responsive
- [x] **Sign up** – full name, email, phone, password, confirm; server + client validation; unique email with clear message; bcrypt-hashed password; redirects to login with success message
- [x] **Login** – generic "Invalid email or password" for any failure; httpOnly cookie session; redirects to dashboard
- [x] **Dashboard (protected)** – "Welcome, <name>", email, phone; server-side check (`401` → redirect to login)
- [x] **Logout** – clears the cookie; back button / dashboard URL redirects to login
- [x] **POS billing (protected)** – 10 products in DB, grid + search, add to cart, +/− quantity, remove, stock limit enforced, line totals / subtotal / 5% GST / grand total rounded to 2 decimals, optional customer name and phone, **Generate bill** (unique bill number, date/time, items, totals) saved in one DB transaction, stock reduced, cart cleared, receipt with **Print** button, bill history (newest first) with click-through to the receipt

### Bonus done
- [x] Landing page products loaded from the same database
- [x] Admin role that can add products from the dashboard (customers/staff cannot; enforced on the server)
- [x] Logged-in user's name shown in the navbar on the landing page
- [x] Lock-out after 5 failed logins (15 minutes)
- [x] Low-stock warning (fewer than 5 left) on dashboard and POS
- [x] Today's sales summary (bills and total) on the dashboard

### Not done / unfinished
- Discount on a bill (not implemented)
- Not deployed (no live link)
- No automated test suite; flows were checked manually and with HTTP calls

## How billing stays correct
* The server **ignores prices sent by the browser**. It reads prices from the database and recalculates everything.
* Money maths is done in integer paise, then converted to rupees with 2 decimals: `GST = round(subtotal × 5 / 100)`.
* `POST /api/bills` runs in a PostgreSQL transaction: lock the product rows (`SELECT … FOR UPDATE`), check stock, insert the bill and items, reduce stock, commit. Any failure rolls everything back, so two cashiers can't oversell the same item.
* Bill items store a snapshot of the product name and price, so old receipts never change.

## Security notes
* Passwords hashed with bcrypt (cost 10); never returned by any API.
* Session cookie: `httpOnly`, `SameSite=Lax`, optional `Secure`; JWT expires after 8 hours.
* All SQL uses parameterised queries. `helmet` headers on. API responses are `Cache-Control: no-store`.
* `.env` is git-ignored; only `.env.example` is committed.

## Project structure
```
freshcart/
├─ package.json            root scripts (install:all, db:setup, dev, build, start)
├─ server/
│  ├─ .env.example
│  ├─ sql/schema.sql, seed.sql
│  └─ src/
│     ├─ index.js          Express app, error handler, serves client/dist if built
│     ├─ db.js, utils.js
│     ├─ middleware/auth.js   requireAuth, requireAdmin
│     ├─ routes/auth.js, products.js, bills.js
│     └─ scripts/setup.js  creates DB, tables, seed data, admin
└─ client/
   ├─ vite.config.js       dev proxy: /api → :5000
   └─ src/
      ├─ App.jsx, AuthContext.jsx, api.js, utils.js, config.js
      ├─ components/Navbar.jsx, ProtectedRoute.jsx, Receipt.jsx
      ├─ pages/Landing, Signup, Login, Dashboard, POS, Bills, BillView
      └─ styles.css
```
Edit the shop address / phone in `client/src/config.js`.

## API summary
| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout` | public |
| GET | `/api/auth/me` | logged in |
| GET | `/api/products?q=` | public |
| POST | `/api/products` | admin |
| POST | `/api/bills` | logged in |
| GET | `/api/bills`, `/api/bills/:id`, `/api/bills/summary/today` | logged in |

## Where AI tools were used
Claude (Anthropic) generated the initial project scaffold and code from the task PDF. I reviewed it, ran it, and can explain and modify each part.
