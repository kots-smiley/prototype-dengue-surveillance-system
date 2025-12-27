# Dengue Surveillance & Early Warning System

A full-stack web application for barangay-level dengue case reporting, trend monitoring, and early warning alerts in the Philippines.

## ⚠️ Important Disclaimer

**This system is NOT a medical diagnostic tool.** It is a risk-based surveillance and early warning platform designed for:
- Centralized dengue case reporting
- Trend monitoring and analysis
- Environmental risk factor tracking
- Rule-based early warning alerts

The system uses **rule-based logic, NOT AI/ML**, to generate risk assessments and alerts.

## 🧱 Tech Stack

### Frontend
- **Framework**: React 18
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Build Tool**: Vite
- **Hosting Target**: Vercel

### Backend
- **Language**: TypeScript
- **Framework**: Express.js (Node.js)
- **ORM**: Prisma
- **Database**: MongoDB
- **API Style**: REST
- **Authentication**: JWT
- **Validation**: Zod

## 🎯 System Features

### 1. Dengue Case Management
- Create, read, update, and delete dengue cases
- Track case status (Suspected/Confirmed)
- Record case source (Public Hospital, Private Hospital, RHU, BHW)
- Age group categorization
- Barangay-level filtering

### 2. Environmental Risk Reporting
- Record environmental risk factors:
  - Stagnant water
  - Poor waste disposal
  - Clogged drainage
  - Housing congestion
- Optional photo URL upload
- Barangay-level reporting

### 3. Dashboard & Analytics
- Monthly case trends (line charts)
- Yearly comparison charts
- Barangay-level risk rankings
- Real-time statistics
- Risk level indicators (Low/Medium/High)

### 4. Early Warning System (Rule-Based)
The system implements rule-based logic to generate alerts:

**High Risk Alert Triggers:**
- 10+ cases in current month AND rainy season active
- 50%+ case increase for 2 consecutive months AND rainy season AND 5+ environmental risks
- 10+ cases AND 5+ environmental risk reports

**Medium Risk Alert Triggers:**
- 50%+ case increase AND rainy season
- 5+ cases AND 3+ environmental risks
- 5+ environmental risks AND rainy season

**Rainy Season**: June to November (Philippines)

### 5. Reports & Exports
- Monthly dengue summary
- Barangay risk ranking
- Export as CSV or JSON
- Case and report exports

## 👥 User Roles

1. **Admin (Barangay / RHU)**
   - Manage users
   - View all dashboards
   - Configure alert thresholds
   - Export reports
   - Full system access

2. **Barangay Health Worker (BHW)**
   - Encode dengue cases (assigned barangay only)
   - Submit environmental risk reports (assigned barangay only)
   - View barangay-level alerts
   - Export reports

3. **Public / Private Hospital Encoder**
   - Submit dengue case reports
   - View submission history
   - Limited access to own submissions

4. **Resident (Optional / Limited)**
   - Report stagnant water or mosquito breeding sites
   - View public dengue advisories

## 📁 Project Structure

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.ts                # Seed script
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/            # Auth, error handling, audit
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic (early warning)
│   │   ├── utils/                 # Utilities
│   │   └── server.ts              # Express server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   ├── contexts/              # React contexts (Auth)
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API client
│   │   ├── types/                 # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
DATABASE_URL="mongodb://localhost:27017/dengue_surveillance?retryWrites=true&w=majority"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Seed initial data:
```bash
npm run prisma:seed
```

7. Start development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔐 Default Login Credentials

After running the seed script, you can login with:

- **Admin**: `admin@dengue.local` / `admin123`
- **BHW 1**: `bhw1@dengue.local` / `bhw123`
- **BHW 2**: `bhw2@dengue.local` / `bhw123`
- **BHW 3**: `bhw3@dengue.local` / `bhw123`
- **Hospital Encoder**: `hospital@dengue.local` / `hospital123`

## 📊 Database Schema

### Models
- **User**: Authentication and user management
- **Barangay**: Barangay information
- **DengueCase**: Dengue case records
- **EnvironmentalReport**: Environmental risk reports
- **Alert**: Early warning alerts
- **AuditLog**: System audit trail

See `backend/prisma/schema.prisma` for full schema details.

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Secure API routes with middleware
- Input validation using Zod
- Password hashing with bcrypt
- Audit logging for all actions

## 📈 Early Warning Logic

The early warning system uses rule-based logic (NOT AI/ML) to assess risk:

1. **Case Trend Analysis**: Compares current month cases with previous months
2. **Seasonal Indicators**: Considers rainy season (June-November)
3. **Environmental Risk Assessment**: Counts environmental risk reports
4. **Threshold-Based Alerts**: Triggers alerts based on predefined thresholds

See `backend/src/services/earlyWarning.ts` for implementation details.

## 🚢 Deployment

### Frontend (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Set environment variable:
- `VITE_API_URL`: Your backend API URL

### Backend

Deploy to any Node.js hosting service (Heroku, Railway, Render, etc.):

1. Set environment variables
2. Run `npm run build`
3. Run `npm start`
4. Ensure MongoDB connection string is set

## ⚠️ Limitations & Important Notes

### For Thesis Defense

1. **No AI/ML**: This system uses rule-based logic only. No machine learning or AI predictions.

2. **Not a Diagnostic Tool**: The system does NOT diagnose dengue. It only tracks reported cases and generates risk-based alerts.

3. **Data Accuracy**: Alert accuracy depends on:
   - Timely case reporting
   - Accurate environmental risk reporting
   - Complete data entry

4. **Rule-Based Limitations**:
   - Thresholds are fixed and may need adjustment based on local conditions
   - Does not account for all epidemiological factors
   - Requires manual review of alerts

5. **Scope**: This is a surveillance system, not a clinical decision support tool.

## 🧪 Testing

Manual testing recommended:
1. Create test cases
2. Submit environmental reports
3. Verify alert generation
4. Test role-based access
5. Test export functionality

## 📝 API Documentation

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (admin only)
- `GET /api/auth/me` - Get current user

### Cases
- `GET /api/cases` - List cases
- `GET /api/cases/:id` - Get case
- `POST /api/cases` - Create case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Reports
- `GET /api/reports` - List reports
- `GET /api/reports/:id` - Get report
- `POST /api/reports` - Create report
- `PUT /api/reports/:id` - Update report

### Alerts
- `GET /api/alerts` - List alerts
- `GET /api/alerts/:id` - Get alert
- `PUT /api/alerts/:id/resolve` - Resolve alert

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/trends` - Case trends
- `GET /api/dashboard/rankings` - Barangay rankings

### Exports
- `GET /api/exports/cases` - Export cases (CSV/JSON)
- `GET /api/exports/reports` - Export reports (CSV/JSON)
- `GET /api/exports/summary` - Export monthly summary

## 🤝 Contributing

This is a thesis project. For improvements:
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

## 📄 License

This project is for academic/research purposes.

## 👨‍💻 Author

Built for Dengue Surveillance & Early Warning System thesis project.

---

**Remember**: This system is for surveillance and early warning purposes only. It is NOT a medical diagnostic tool.


