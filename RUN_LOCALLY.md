# How to Run BeautyShine CMS Locally

This guide walks you through setting up and running **BeautyShine CMS** on your local development machine.

---

## 🛠 Tech Stack Overview

- **Backend:** Laravel 12 (PHP 8.2+)
- **Frontend:** React 18, Inertia.js v2, TypeScript, Vite 6, Tailwind CSS v4, Ant Design
- **Database:** MySQL (recommended) or SQLite
- **Queue/Cache/Session:** Database driver by default

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:

1. **PHP >= 8.2** with required extensions:
   - `pdo_mysql` (or `pdo_sqlite`), `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `curl`
   
   > ⚠️ **Important (Fixing "requires php >=8.2 -> your php version (7.4.33) does not satisfy that requirement"):**
   > If running `php -v` shows PHP 7.4, your Mac's default PHP is too old for Laravel 12.
   > Run the following commands in Terminal to install and switch to PHP 8.2:
   > ```bash
   > brew install php@8.2
   > brew unlink php@7.4 2>/dev/null
   > brew link --force --overwrite php@8.2
   > ```
   > If brew mentions that `php@8.2` is keg-only, add it to your shell PATH:
   > ```bash
   > echo 'export PATH="/opt/homebrew/opt/php@8.2/bin:$PATH"' >> ~/.zshrc
   > echo 'export PATH="/opt/homebrew/opt/php@8.2/sbin:$PATH"' >> ~/.zshrc
   > source ~/.zshrc
   > ```
   > Verify with:
   > ```bash
   > php -v  # Should show PHP 8.2.x
   > ```
   > *(Alternative: Download and install [Laravel Herd](https://herd.laravel.com/) for one-click PHP 8.2/8.3 environment on macOS).*

2. **Composer (v2.x)**: [getcomposer.org](https://getcomposer.org/)
3. **Node.js (v18.x or v20.x+) & npm**:
   ```bash
   node -v  # e.g., v20.x
   npm -v
   ```
4. **MySQL Database Server**:
   - Local MySQL instance (via Homebrew, DBngin, Docker, or MySQL Workbench).
5. **Frontend Client:** `beautyshine` Next.js app located at `../beautyshine` (see [Frontend Local Guide](../beautyshine/RUN_LOCALLY.md)).


---

## 🚀 Setup Steps

### 1. Open Terminal and Navigate to Project Root
```bash
cd /Users/elpidakyriakou/PersonalProjects/Melekkos/beautyshine-cms
```

---

### 2. Configure Environment (`.env`)

If you don't already have a `.env` file, copy it from `.env.example`:

```bash
cp .env.example .env
```

Review and adjust the `.env` settings for local development:

```dotenv
APP_NAME="BeautyShine CMS"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database Configuration (adjust to your local MySQL credentials)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=beautyshine_db
DB_USERNAME=root
DB_PASSWORD=

# Session and Queue drivers
SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

# Local frontend client URL
FRONTEND_URL="http://localhost:3000"
SANCTUM_STATEFUL_DOMAINS="localhost:3000,127.0.0.1:3000,localhost:8000,127.0.0.1:8000"
```

> **Note on Existing Remote DB:** If your `.env` is currently pointing to the remote AWS RDS instance, be careful running fresh migrations or seeds against production/live data. For safe local testing, point `DB_HOST` to `127.0.0.1`.

---

### 3. Install PHP Dependencies

```bash
composer install
```

*(If you have multiple PHP versions installed, ensure you execute composer with PHP 8.2+: `/opt/homebrew/opt/php@8.2/bin/php $(which composer) install`)*

---

### 4. Install Node / NPM Dependencies

```bash
npm install
```

---

### 5. Generate Application Key

If `APP_KEY` is empty in `.env`:
```bash
php artisan key:generate
```

---

### 6. Create Storage Symlink

Ensure uploaded public media files are accessible from the web:
```bash
php artisan storage:link
```

---

### 7. Run Database Migrations & Seed Data

Ensure your database exists in MySQL (e.g., `CREATE DATABASE beautyshine_db;`), then run:

```bash
php artisan migrate
```

To populate the database with default roles, permissions, and the initial superadmin user:

```bash
php artisan db:seed
```

#### 🔑 Default Seeded Admin Credentials:
- **Email:** `superadmin@beautyshine.com`
- **Password:** `pXvJ3kC8bA9lR6sVwE7y`

---

## 🏃‍♂️ Running the Project

You can run both the backend server and frontend asset compiler in one of the following ways:

### Option A: All-in-One Command (Recommended)

Run:
```bash
composer run dev
```
*This uses `npx concurrently` to start:*
1. Laravel development server (`php artisan serve`)
2. Queue worker (`php artisan queue:listen --tries=1`)
3. Vite hot-module-reloading server (`npm run dev`)

Or run via npm:
```bash
npm run start
```

---

### Option B: Separate Terminal Windows

If you prefer separate processes for clearer debugging logs:

**Terminal 1 — Laravel Server:**
```bash
php artisan serve
```
> Runs at: [http://localhost:8000](http://localhost:8000)

**Terminal 2 — Vite Dev Server (React & Assets):**
```bash
npm run dev
```
> Runs Vite with HMR on [http://localhost:5173](http://localhost:5173)

**Terminal 3 (Optional) — Background Queue Worker:**
```bash
php artisan queue:listen --tries=1
```

---

## 🌐 Accessing the Application

1. Open your browser and go to:
   ```
   http://localhost:8000/login
   ```
2. Log in with the superadmin credentials:
   - **Email:** `superadmin@beautyshine.com`
   - **Password:** `pXvJ3kC8bA9lR6sVwE7y`
3. You will be redirected to the CMS Dashboard (`/dashboard`).

---

## 🧹 Maintenance & Troubleshooting

### Clearing Caches
If you encounter outdated routing, cached config, or view issues, run:
```bash
./clear-cache.sh
```
Or manually run:
```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear
```

### Build Production Assets
To test production builds of the React/Vite frontend:
```bash
npm run build
```

### File Permission Issues (macOS / Linux)
If storage permissions cause errors:
```bash
chmod -R 775 storage bootstrap/cache
```
