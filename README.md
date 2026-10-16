# ORBINEX — Powered by AMT
## Campus Mobility & Student Support SaaS Platform (MBCCET)

ORBINEX is a production-oriented, full-stack campus mobility and student-support SaaS platform designed initially for **Mar Baselios Christian College of Engineering & Technology (MBCCET)**, Peermade, Kerala.

The platform provides a centralized, authenticated system for:
- **₹100 Vehicle Arrangement**: Fixed-rate affordable campus mobility network
- **MBCCET → Kuttikanam Transport**: Real-time auto rickshaw availability and ride requests
- **Medical Transportation**: Expedited emergency transit to Taluk Hospital and medical posts
- **Hostel Food Delivery**: Night meal and dietary token support for campus hostels
- **College Bus Information**: Real-time tracking and contacts for the college's 3 official buses
- **Campus Security Directory**: 24/7 direct calling to campus gates and warden desks

---

## 1. Architecture Overview

```text
ORBINEX
│
├── Frontend (React 19 + TypeScript + Vite + Tailwind CSS)
│   ├── Public Landing Page
│   ├── Student Portal (Mobile-first quick actions, service requests, status receipts)
│   └── Admin Portal (Dashboard stats, auto/bus/security CRUD, vehicle dispatch, audit logs)
│
├── Backend API (Node.js + Express + TypeScript)
│   ├── Authentication (JWT sessions, HTTP-only cookies, rate limiting)
│   ├── Authorization Middleware (Strict RBAC: STUDENT vs ADMIN)
│   ├── Parametric Validation & Anti-Brute-Force
│   └── Audit Logging (Tamper-evident administrative action logging)
│
└── Database (Relational SQL Engine)
    ├── Institutions (Multi-tenant partition)
    ├── Admins (Hashed credentials via bcrypt)
    ├── Users / Students
    ├── Autos (Campus fleet)
    ├── Buses (3 college buses)
    ├── Security Contacts
    ├── Transport Requests (ORB-2026-XXXXX)
    ├── Medical Requests (ORB-MED-XXXXX)
    ├── Food Delivery Requests (ORB-FOOD-XXXXX)
    └── Audit Logs
```

---

## 2. Default Administrator Credentials

As specified by project owner (**Abin / AMT**):

| Role | Username | Password |
|---|---|---|
| **Campus Admin** | `Abin` | `abinabiya` |

> **Security Note:** The plaintext password is never stored or exposed in client-side code. It is hashed using `bcrypt` during the database initialization seed process.

---

## 3. Getting Started & Installation

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key configuration parameters:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: `development` or `production`
- `JWT_SECRET`: Secret key for cryptographic session signing
- `DATABASE_URL`: Optional external PostgreSQL connection string

### Step 3: Run the Application
Start the unified full-stack server (runs both Express API and Vite SPA on port 3000):
```bash
npm run dev
```

The application will be live at `http://localhost:3000`.

---

## 4. Production Deployment

### Build the Frontend Bundle:
```bash
npm run build
```

### Start in Production Mode:
```bash
NODE_ENV=production npm start
```

### Deploying to PostgreSQL:
A complete production PostgreSQL DDL schema with constraints, foreign keys, and indexes is provided in `db/schema.sql`:
```bash
psql -d $DATABASE_URL -f db/schema.sql
```

---

## 5. Security & Multi-Tenancy

- **Multi-Tenant Isolation**: Every database entity is indexed with an `institution_id` (defaulting to `MBCCET`) for clean tenant separation.
- **Strict Authorization**: Students cannot view or modify other students' requests, and all administrative endpoints strictly verify `role === 'ADMIN'`.
- **Anti-Brute-Force Rate Limiting**: Automatic 5-minute lockout after 5 consecutive failed login attempts per IP.
- **Empty State Compliance**: Autos, buses, and security contacts begin empty and are exclusively provisioned through the Administrator console.
