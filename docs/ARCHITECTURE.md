# StockMaster IMS - Architecture Documentation

## System Overview

StockMaster is a full-stack Inventory Management System designed to digitize and streamline stock operations. The system follows a modern three-tier architecture with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │   Pages      │  Components  │   Services/API       │ │
│  │  - Dashboard │  - Layout    │   - Axios Client     │ │
│  │  - Products  │  - Common    │   - Auth Service     │ │
│  │  - Operations│  - Features  │   - Product Service  │ │
│  │              │              │   - Operation Svc    │ │
│  └──────────────┴──────────────┴──────────────────────┘ │
│           │                                               │
│  ┌────────▼───────────────────────────────────────────┐ │
│  │   State Management (Zustand) & React Query         │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ REST API (JSON)
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Backend (Node.js/Express)                   │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │   Routes     │ Controllers  │   Services           │ │
│  │  - Auth      │  - Auth      │   - Stock Service    │ │
│  │  - Products  │  - Products  │   (Core Business     │ │
│  │  - Operations│  - Operations│    Logic)            │ │
│  │  - Inventory │  - Inventory │                      │ │
│  └──────────────┴──────────────┴──────────────────────┘ │
│           │                                               │
│  ┌────────▼───────────────────────────────────────────┐ │
│  │   Middleware (Auth, Validation, Error Handling)    │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Prisma ORM
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Database (PostgreSQL)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Tables:                                         │  │
│  │  - users                                         │  │
│  │  - products                                      │  │
│  │  - locations                                     │  │
│  │  - stock_levels (Current inventory)             │  │
│  │  - stock_ledger (Transaction history)           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (React + Vite)

**Technology Stack:**
- React 18 with Hooks
- React Router for navigation
- Tailwind CSS for styling
- Zustand for auth state management
- React Query for server state
- React Hook Form for form management
- Axios for HTTP requests

**Key Features:**
- Responsive design (Desktop + Mobile)
- Role-based UI rendering
- Real-time data updates
- Form validation
- Toast notifications

### 2. Backend (Node.js/Express)

**Technology Stack:**
- Express.js web framework
- Prisma ORM for database access
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation

**Key Features:**
- RESTful API architecture
- JWT-based authentication
- Role-based access control
- Input validation & sanitization
- Centralized error handling
- Request logging (Morgan)
- Rate limiting
- Security headers (Helmet)

### 3. Database (PostgreSQL)

**Schema Design:**
- Normalized relational structure
- Foreign key constraints
- Unique constraints for data integrity
- Indexes for query optimization
- Timestamps for audit trails

## Core Business Logic

### Stock Operations Flow

```
┌─────────────────────────────────────────────────┐
│ User Creates Operation (Draft)                  │
│ - Receipt / Delivery / Transfer                 │
│ - Status: DRAFT                                  │
│ - NOT yet affecting stock levels                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ User Clicks "Validate"                          │
│ POST /api/operations/validate/:moveId           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ Stock Service - validateOperation()             │
│ ┌─────────────────────────────────────────────┐ │
│ │ 1. Begin Database Transaction               │ │
│ │ 2. Update stock_ledger.status = VALIDATED   │ │
│ │ 3. Calculate stock changes:                 │ │
│ │    - RECEIPT: +qty at destination          │ │
│ │    - DELIVERY: -qty at source              │ │
│ │    - TRANSFER: -qty source, +qty dest      │ │
│ │ 4. Update stock_levels table                │ │
│ │    - Upsert logic (create or update)       │ │
│ │    - Validate sufficient stock (delivery)   │ │
│ │ 5. Commit Transaction                       │ │
│ └─────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ Response: Updated operation & stock levels      │
│ Frontend: Refresh dashboard & lists             │
└─────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### users
- Authentication and user management
- Roles: ADMIN, MANAGER, STAFF

#### products
- Product master data
- SKU code, category, UOM
- Reorder level for alerts

#### locations
- Location master data
- Types: WAREHOUSE, RACK, SHELF, ZONE, SUPPLIER, CUSTOMER

#### stock_levels
- **Real-time inventory snapshot**
- Unique constraint: (product_id, location_id)
- Updated only when operations are validated

#### stock_ledger
- **Complete transaction history**
- Immutable audit trail
- Links to product, locations, and user
- Document types: RECEIPT, DELIVERY, INTERNAL_TRANSFER, ADJUSTMENT
- Status: DRAFT, VALIDATED, CANCELLED

## API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login
GET    /api/auth/me          - Get current user
```

### Products
```
GET    /api/products         - List products
POST   /api/products         - Create product (MANAGER+)
GET    /api/products/:id     - Get product details
PUT    /api/products/:id     - Update product (MANAGER+)
DELETE /api/products/:id     - Delete product (ADMIN)
```

### Operations (Stock Movements)
```
POST   /api/operations/receipt    - Create receipt
POST   /api/operations/delivery   - Create delivery
POST   /api/operations/transfer   - Create transfer
POST   /api/operations/validate/:moveId  - VALIDATE operation ⚡
GET    /api/operations            - List operations
GET    /api/operations/:moveId    - Get operation details
DELETE /api/operations/:moveId    - Cancel draft operation
```

### Inventory
```
GET    /api/inventory/stock-levels  - Current stock levels
GET    /api/inventory/stock-ledger  - Movement history
GET    /api/inventory/low-stock     - Low stock alerts
```

### Dashboard
```
GET    /api/dashboard/kpis          - Dashboard KPIs
```

## Security

### Authentication
- JWT-based stateless authentication
- Token expiry: 7 days (configurable)
- Secure password hashing with bcrypt

### Authorization
- Role-based access control (RBAC)
- Route-level protection
- Controller-level role checks

### Input Validation
- express-validator for all inputs
- Prisma type safety
- SQL injection prevention (parameterized queries)

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting

## Scalability Considerations

### Database
- Indexed columns for fast lookups
- Connection pooling via Prisma
- Prepared statements for performance

### API
- Stateless design (horizontal scaling)
- Efficient query patterns
- Pagination support (ready to implement)

### Frontend
- Code splitting
- Lazy loading routes
- React Query caching
- Optimistic updates

## Development Workflow

1. **Local Development**
   - Backend: `npm run dev` (nodemon)
   - Frontend: `npm run dev` (Vite)
   - Database: Local PostgreSQL

2. **Database Migrations**
   - Prisma migrate dev
   - Automatic migration on schema changes

3. **Testing**
   - Unit tests: Jest
   - Integration tests: Supertest
   - E2E tests: (ready to add)

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Load Balancer (Optional)        │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
┌────────▼─────┐  ┌──────▼────────┐
│  Frontend    │  │   Backend     │
│  (Vercel/    │  │   (Railway/   │
│   Netlify)   │  │    Render)    │
└──────────────┘  └───────┬───────┘
                          │
                  ┌───────▼───────┐
                  │  PostgreSQL   │
                  │  (Managed DB) │
                  └───────────────┘
```

## Future Enhancements

1. **Barcode Scanning** - Mobile barcode integration
2. **Real-time Updates** - WebSocket for live updates
3. **Advanced Reporting** - Charts and analytics
4. **Multi-warehouse** - Enhanced location hierarchy
5. **API Rate Limiting** - Per-user limits
6. **Audit Logs** - Detailed activity tracking
7. **File Uploads** - Product images
8. **Export/Import** - CSV/Excel support

