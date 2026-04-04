# Bumblebee Berries

A local raspberry farm store — customers can browse availability and place pickup orders, and the farm owner manages orders through a password-protected admin panel.

**Tech stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, SQLite (via `better-sqlite3`), JWT auth

---

## Prerequisites

### 1. Install Node.js and npm

Node.js includes npm. The recommended way is to install a version manager first.

**Using [nvm](https://github.com/nvm-sh/nvm) (macOS / Linux):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Restart your terminal, then install and use a recent LTS version of Node:

```bash
nvm install --lts
nvm use --lts
```

**On Windows:** download the installer from [nodejs.org](https://nodejs.org) (choose the LTS version).

Verify both are installed:

```bash
node -v   # should print v20.x.x or higher
npm -v    # should print 10.x.x or higher
```

---

## Setup

### 2. Get the code

If you received this as a zip, extract it. Otherwise clone the repo:

```bash
git clone <repo-url>
cd bumblebee-berries
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create the environment file

The app requires a secret key for signing admin login sessions. Create a file called `.env.local` in the project root:

```bash
# .env.local
JWT_SECRET=replace-this-with-a-long-random-string
```

You can generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output as the value of `JWT_SECRET`.

> `.env.local` is never committed to version control — keep it private.

---

## Running the app

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First-time admin setup

On a fresh install the admin account does not exist yet. Visit:

```
http://localhost:3000/setup
```

Choose an admin password. You will be redirected here automatically if setup has not been completed. Once a password is set, this page is no longer accessible.

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Customer-facing storefront — browse availability and place an order |
| `/order` | Order confirmation / detail |
| `/setup` | One-time admin password setup (only available before first login) |
| `/admin/login` | Admin login |
| `/admin` | Order management dashboard |
| `/admin/settings` | Store settings (price per cup, daily cap, per-day overrides) |

---

## Data storage

The app uses a local SQLite database stored at `data/bumblebee.db`. This file is created automatically on first run — no database server is needed.

---

## Production build

```bash
npm run build   # compile and optimize
npm run start   # run the production server on port 3000
```

To run on a different port:

```bash
npm run start -- -p 8080
```
