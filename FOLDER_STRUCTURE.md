# 📁 StockMaster IMS - Complete Folder Structure

## Overview

This document provides a complete visual representation of the project's folder structure.

```
stock-sync/
│
├── 📦 backend/                          # Node.js/Express Backend
│   ├── prisma/
│   │   ├── schema.prisma               # 🔑 Database schema definition
│   │   └── seed.js                     # Database seeding script
│   │
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/            # Request handlers
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── product.controller.js
│   │   │   │   ├── location.controller.js
│   │   │   │   ├── operation.controller.js  # 🔑 Stock operations
│   │   │   │   ├── inventory.controller.js
│   │   │   │   └── dashboard.controller.js
│   │   │   │
│   │   │   ├── middleware/             # Express middleware
│   │   │   │   ├── auth.js            # JWT authentication
│   │   │   │   ├── validate.js        # Input validation
│   │   │   │   ├── errorHandler.js    # Global error handler
│   │   │   │   └── notFound.js        # 404 handler
│   │   │   │
│   │   │   └── routes/                 # API route definitions
│   │   │       ├── auth.routes.js
│   │   │       ├── product.routes.js
│   │   │       ├── location.routes.js
│   │   │       ├── operation.routes.js    # 🔑 Core operations
│   │   │       ├── inventory.routes.js
│   │   │       └── dashboard.routes.js
│   │   │
│   │   ├── services/                   # Business logic layer
│   │   │   └── stock.service.js       # 🔑 Core stock operations
│   │   │
│   │   ├── config/                     # Configuration files
│   │   ├── types/                      # Type definitions
│   │   └── utils/                      # Utility functions
│   │
│   ├── tests/
│   │   ├── unit/                       # Unit tests
│   │   └── integration/                # Integration tests
│   │
│   ├── .gitignore
│   ├── env.template                    # Environment variables template
│   ├── package.json
│   ├── README.md
│   └── server.js                       # 🚀 Application entry point
│
├── 🎨 frontend/                         # React Frontend
│   ├── public/                         # Static assets
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                 # Reusable components
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   │
│   │   │   ├── layouts/                # Layout components
│   │   │   │   ├── MainLayout.jsx     # 🔑 Main app layout
│   │   │   │   └── AuthLayout.jsx     # Authentication layout
│   │   │   │
│   │   │   └── features/               # Feature-specific components
│   │   │       ├── auth/
│   │   │       ├── dashboard/
│   │   │       ├── products/
│   │   │       ├── operations/
│   │   │       └── inventory/
│   │   │
│   │   ├── pages/                      # Page components
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.jsx      # 🔑 Main dashboard
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── Products.jsx
│   │   │   │   ├── ProductDetail.jsx
│   │   │   │   └── CreateProduct.jsx
│   │   │   │
│   │   │   ├── operations/
│   │   │   │   ├── Receipts.jsx       # Incoming stock
│   │   │   │   ├── Deliveries.jsx     # Outgoing stock
│   │   │   │   └── Transfers.jsx      # Internal transfers
│   │   │   │
│   │   │   └── inventory/
│   │   │       ├── StockLevels.jsx    # Current inventory
│   │   │       └── StockLedger.jsx    # Movement history
│   │   │
│   │   ├── services/                   # API integration
│   │   │   ├── api.js                 # 🔑 Axios instance
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── locationService.js
│   │   │   ├── operationService.js    # 🔑 Stock operations API
│   │   │   ├── inventoryService.js
│   │   │   └── dashboardService.js
│   │   │
│   │   ├── stores/                     # State management
│   │   │   └── authStore.js           # 🔑 Auth state (Zustand)
│   │   │
│   │   ├── hooks/                      # Custom React hooks
│   │   ├── utils/                      # Utility functions
│   │   ├── styles/
│   │   │   └── index.css              # 🔑 Global styles + Tailwind
│   │   │
│   │   ├── types/                      # TypeScript types (if needed)
│   │   ├── assets/                     # Images, icons, etc.
│   │   │   ├── images/
│   │   │   └── icons/
│   │   │
│   │   ├── App.jsx                    # 🔑 Root component
│   │   └── main.jsx                   # 🚀 Application entry point
│   │
│   ├── tests/
│   │   ├── unit/                       # Unit tests
│   │   └── e2e/                        # End-to-end tests
│   │
│   ├── .gitignore
│   ├── index.html                      # HTML template
│   ├── package.json
│   ├── postcss.config.js              # PostCSS configuration
│   ├── tailwind.config.js             # 🔑 Tailwind CSS config
│   ├── vite.config.js                 # 🔑 Vite configuration
│   └── README.md
│
├── 🔗 shared/                          # Shared code (Frontend + Backend)
│   ├── types/
│   │   └── index.js                   # Shared type definitions
│   │
│   ├── constants/
│   │   └── index.js                   # 🔑 Shared constants
│   │
│   ├── utils/
│   │   └── formatters.js              # Formatting utilities
│   │
│   └── validators/
│       ├── productValidator.js        # Product validation rules
│       └── operationValidator.js      # Operation validation rules
│
├── 📚 docs/                            # Documentation
│   ├── ARCHITECTURE.md                # 🔑 System architecture
│   ├── API_DOCUMENTATION.md           # 🔑 Complete API reference
│   ├── SETUP_GUIDE.md                 # 🔑 Installation guide
│   ├── api/                           # API-specific docs
│   ├── architecture/                  # Architecture diagrams
│   └── deployment/                    # Deployment guides
│
├── 🛠️ scripts/                         # Utility scripts
│   ├── setup/                         # Setup scripts
│   ├── deployment/                    # Deployment scripts
│   └── migration/                     # Data migration scripts
│
├── 🐳 docker/                          # Docker configurations
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── ⚙️ config/                          # Project-wide configuration
│
├── .gitignore                         # Root gitignore
├── FOLDER_STRUCTURE.md                # This file
└── README.md                          # 🔑 Main project README
```

---

## Key Files Explained

### 🔑 Critical Files

| File | Purpose |
|------|---------|
| `backend/prisma/schema.prisma` | Database schema - defines all tables and relationships |
| `backend/src/services/stock.service.js` | Core business logic for stock operations |
| `backend/src/api/controllers/operation.controller.js` | Handles all stock operation requests |
| `backend/src/server.js` | Backend application entry point |
| `frontend/src/App.jsx` | Frontend routing and protected routes |
| `frontend/src/services/api.js` | Axios configuration with interceptors |
| `frontend/src/components/layouts/MainLayout.jsx` | Main application layout with sidebar |
| `docs/ARCHITECTURE.md` | Complete system architecture documentation |
| `docs/API_DOCUMENTATION.md` | Complete API reference |
| `README.md` | Project overview and quick start |

---

## File Count Summary

```
Total Directories: ~50
Total Files: ~80+

Backend:
  - Routes: 6
  - Controllers: 6
  - Services: 1 (core)
  - Middleware: 4

Frontend:
  - Pages: 12
  - Services: 7
  - Components: 10+
  - Layouts: 2

Shared:
  - Constants: 1
  - Validators: 2
  - Utilities: 1

Documentation:
  - Main docs: 3
  - READMEs: 3
```

---

## Technology Stack by Folder

### Backend (`/backend`)
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt
- **Validation:** express-validator

### Frontend (`/frontend`)
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State:** Zustand + React Query
- **Forms:** React Hook Form
- **HTTP:** Axios
- **Router:** React Router v6

### Shared (`/shared`)
- **Language:** JavaScript (ES6+)
- **Purpose:** Common code between frontend and backend

---

## Naming Conventions

### Files
- **Components:** PascalCase (e.g., `MainLayout.jsx`)
- **Services:** camelCase with suffix (e.g., `authService.js`)
- **Controllers:** camelCase with suffix (e.g., `auth.controller.js`)
- **Routes:** camelCase with suffix (e.g., `auth.routes.js`)
- **Utilities:** camelCase (e.g., `formatters.js`)

### Folders
- **Lowercase with hyphens** for multi-word (e.g., `stock-levels`)
- **camelCase** for code folders (e.g., `middleware`)

---

## Quick Navigation

### To understand the system:
1. Start with `/README.md`
2. Read `/docs/ARCHITECTURE.md`
3. Review `/backend/prisma/schema.prisma`

### To set up the project:
1. Follow `/docs/SETUP_GUIDE.md`
2. Configure `/backend/.env`
3. Run migrations and seed

### To develop features:
1. Backend: Add routes → controllers → services
2. Frontend: Add pages → components → services
3. Test with Prisma Studio

### To understand the API:
1. Read `/docs/API_DOCUMENTATION.md`
2. Check route files in `/backend/src/api/routes/`
3. Test with Postman or cURL

---

## Next Steps

After understanding this structure:
1. ✅ Read the main README.md
2. ✅ Follow the SETUP_GUIDE.md
3. ✅ Review the ARCHITECTURE.md
4. ✅ Explore the Prisma schema
5. ✅ Start development!

---

**Legend:**
- 🔑 = Critical/Important file
- 🚀 = Entry point
- 📦 = Backend
- 🎨 = Frontend
- 🔗 = Shared
- 📚 = Documentation
- 🛠️ = Tooling

