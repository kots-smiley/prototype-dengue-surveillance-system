# HealthWatch — Multi-Disease Surveillance & Early Warning System

A full-stack web application for **community-level, multi-disease case reporting, trend monitoring, and rule-based early warning alerts** for the **Municipality of Lopez, Quezon**.

## ⚠️ Important Disclaimer

**This system is NOT a medical diagnostic tool.** It is a risk-based surveillance and early warning platform for Rural Health Units (RHU) and Barangay Health Workers (BHW). It supports:

- Centralized, multi-disease case reporting
- Trend monitoring and analysis per disease
- Environmental / transmission-risk factor tracking
- Rule-based early warning alerts

The early-warning engine uses **configurable rule-based logic, NOT AI/ML**. The forecast view uses **simple linear regression** (basic statistics) for short-term projection — clearly labeled as such.

## 🧱 Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, React Router, Recharts |
| API communication | Native **Fetch API** (centralized wrapper) |
| Backend | Express.js + TypeScript |
| ORM | Prisma v5 |
| Database | MongoDB |
| Validation | Zod (frontend + backend) |
| Auth | JWT + bcrypt |
| Security | helmet, role-based access control |
| Hosting | Vercel (frontend + forecast), Render/Node (backend), MongoDB Atlas |

## 🗂 Applications

This is a monorepo with three apps:

| Folder | Description |
| :--- | :--- |
| `backend/` | REST API, layered module architecture (Route → Zod → Controller → Service → Repository) |
| `frontend/` | Authenticated admin/RHU dashboard |
| `forecast/` | Public, no-login forecast site (reads public endpoints) |

## 🎯 Features

### Disease Registry (configurable)
The RHU admin manages the list of tracked diseases. Each disease has:
- A transmission category (vector-borne, water-borne, airborne, direct-contact, other)
- A monthly case threshold and spike-percentage threshold (drives alerts)
- Seasonal transmission months
- Notifiable (PIDSR) flag and active/inactive status

Pre-seeded with PIDSR-style diseases: Dengue, Malaria, Typhoid Fever, Acute Bloody Diarrhea, Leptospirosis, Influenza-like Illness, Measles, Tuberculosis, and COVID-19.

### Case Management (multi-disease)
Create/read/update/delete cases linked to a disease and barangay. Tracks status (Suspected/Probable/Confirmed), outcome (Ongoing/Recovered/Died), age, sex, source, and onset date.

### Environmental Risk Reports (by category)
Risk factors grouped by transmission category:
- **Vector-borne:** stagnant water, poor waste disposal, clogged drainage, housing congestion
- **Water-borne:** unsafe water source, poor sanitation, open defecation, food contamination
- **Airborne:** overcrowding, poor ventilation, active respiratory case nearby

### Dashboard & Analytics
Per-disease and overall stats, monthly trends, disease breakdown, barangay rankings, and a rule-based 3-month projection.

### Early Warning (rule-based)
For each active disease and barangay, the engine compares current vs. previous month case counts, factors in the disease's seasonal months and matching environmental risk reports, and classifies risk as **LOW / MEDIUM / HIGH** against the disease's own configurable thresholds. Alerts are created, updated, or auto-resolved accordingly.

### Reports & Exports
Cases, risk reports, and a monthly summary, exportable as CSV or Excel (XLSX), with optional disease/date filters.

## 👥 User Roles

1. **Admin (RHU)** — full access: manage users, diseases, barangays; view all dashboards; export.
2. **Barangay Health Worker (BHW)** — encode cases and risk reports for their assigned barangay; view alerts; export.
3. **Hospital Encoder** — submit case reports.
4. **Resident (optional)** — submit risk reports; view public advisories.

## 🚀 Setup

### Prerequisites
- Node.js 20 LTS and npm
- MongoDB (local or MongoDB Atlas)

### Backend

```bash
cd backend
npm install
# copy env.example to .env and fill in DATABASE_URL + JWT_SECRET
npm run prisma:generate
npm run prisma:db:push   # sync schema to MongoDB
npm run db:seed          # seed barangays, diseases, users, sample data
npm run dev              # http://localhost:5000
```

### Frontend (admin)

```bash
cd frontend
npm install
# copy env.example to .env (VITE_API_BASE_URL=http://localhost:5000/api)
npm run dev              # http://localhost:3000
```

### Forecast (public)

```bash
cd forecast
npm install
# copy env.example to .env (VITE_API_URL=http://localhost:5000)
npm run dev
```

## 🔐 Default Login Credentials

After seeding:

- **Admin:** `admin@healthwatch.local` / `admin123`
- **BHW:** `bhw@healthwatch.local` / `bhw123`
- **Hospital Encoder:** `hospital@healthwatch.local` / `hospital123`

> Change these immediately in any non-development environment.

## 📊 Data Model

`User`, `Barangay`, `Disease`, `Case`, `RiskReport`, `Alert`, `AuditLog`. See `backend/prisma/schema.prisma`.

## 📝 API Overview

All responses use the envelope `{ success, message, data }`.

| Group | Endpoints |
| :--- | :--- |
| Auth | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/auth/change-password` |
| Diseases | `GET/POST /api/diseases`, `GET/PUT/DELETE /api/diseases/:id` |
| Cases | `GET/POST /api/cases`, `GET/PUT/DELETE /api/cases/:id` |
| Risk Reports | `GET/POST /api/reports`, `GET/PUT/DELETE /api/reports/:id` |
| Alerts | `GET /api/alerts`, `GET /api/alerts/:id`, `PUT /api/alerts/:id/status`, `PUT /api/alerts/:id/resolve` |
| Barangays | `GET/POST /api/barangays`, `GET/PUT/DELETE /api/barangays/:id` |
| Users | `GET/POST /api/users`, `GET/PUT/DELETE /api/users/:id` |
| Dashboard | `GET /api/dashboard/stats|trends|rankings|disease-breakdown|barangay-cases` |
| Exports | `GET /api/exports/cases|reports|summary` |
| Public | `GET /api/public/diseases|stats|time-series|forecast/summary` |

## 🏗 Architecture & Standards

This project follows the standards in `Structure.md` (scalable layered architecture, separation of concerns). See `ARCHITECTURE.md` for how the codebase maps to those rules and the two documented, intentional deviations (React Router v7 and a `src/` source root).

## 📄 License

For academic/research purposes.

---

**Remember:** HealthWatch is for surveillance and early warning only. It is NOT a medical diagnostic tool.
