# StockMaster IMS - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd stock-sync
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Database Setup

#### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE stockmaster_db;

# Exit psql
\q
```

### 4. Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.template .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/stockmaster_db?schema=public"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** Change `JWT_SECRET` to a strong, random string in production!

#### Frontend Environment Variables (Optional)

Create a `.env` file in the `frontend` directory if you need custom API URL:

```bash
cd frontend
touch .env
```

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Run Database Migrations

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# (Optional) Seed database with sample data
npm run prisma:seed
```

### 6. Start the Development Servers

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════╗
║   StockMaster IMS Backend Server         ║
║   Running on port: 5000                  ║
║   Environment: development               ║
╚═══════════════════════════════════════════╝
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Creating Your First User

### Option 1: Via UI (Recommended)

1. Navigate to `http://localhost:3000`
2. Click "Sign up" link
3. Fill in the registration form
4. Click "Create Account"

### Option 2: Via API

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stockmaster.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'
```

## Database Management

### Prisma Studio (Visual Database Browser)

```bash
cd backend
npm run prisma:studio
```

This opens a browser-based GUI at `http://localhost:5555` where you can:
- View all tables
- Add/edit/delete records
- Test relationships

### Common Prisma Commands

```bash
# Generate Prisma Client after schema changes
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stockmaster.com",
    "password": "admin123"
  }'

# Save the token from response
TOKEN="your_jwt_token_here"

# Get products
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. Import the API endpoints
2. Create an environment with:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (will be set after login)

## Project Structure

```
stock-sync/
├── backend/                 # Node.js/Express Backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   └── routes/
│   │   ├── services/       # Business logic
│   │   ├── config/
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── .env                # Environment variables
│
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/       # API calls
│   │   ├── stores/         # State management
│   │   ├── styles/
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── shared/                  # Shared code
│   ├── types/
│   ├── constants/
│   └── utils/
│
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   └── SETUP_GUIDE.md
│
└── README.md
```

## Troubleshooting

### Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Check `DATABASE_URL` in `.env` file
3. Verify database exists:
   ```bash
   psql -U postgres -l
   ```

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
1. Kill the process using the port:
   ```bash
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. Or change the port in `.env`:
   ```env
   PORT=5001
   ```

### Prisma Migration Error

**Error:** `Migration failed to apply`

**Solution:**
1. Reset the database:
   ```bash
   npx prisma migrate reset
   ```

2. Or manually drop and recreate:
   ```bash
   psql -U postgres
   DROP DATABASE stockmaster_db;
   CREATE DATABASE stockmaster_db;
   \q
   
   npx prisma migrate dev
   ```

### CORS Error in Frontend

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
1. Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
2. Ensure backend is running
3. Check browser console for exact error

### JWT Token Error

**Error:** `jwt malformed` or `invalid token`

**Solution:**
1. Check `JWT_SECRET` is set in backend `.env`
2. Logout and login again to get a new token
3. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```

## Next Steps

Once your setup is complete:

1. **Create Master Data**
   - Add Locations (Warehouse, Racks, etc.)
   - Add Products (with SKU codes)

2. **Test Stock Operations**
   - Create a Receipt (incoming stock)
   - Validate the receipt
   - Check stock levels
   - Create a Delivery
   - Validate and see stock decrease

3. **Explore Features**
   - Dashboard KPIs
   - Stock movement history
   - Low stock alerts
   - Product search and filters

## Development Tips

### Hot Reload

- **Backend:** Uses `nodemon` - saves automatically restart server
- **Frontend:** Uses Vite HMR - instant updates without refresh

### Code Formatting

```bash
# Backend
cd backend
npm run format

# Frontend
cd frontend
npm run format
```

### Database Inspection

Use Prisma Studio for quick database inspection:
```bash
cd backend
npm run prisma:studio
```

## Production Deployment

See `docs/DEPLOYMENT.md` for production deployment guides (coming soon).

## Support

For issues or questions:
1. Check the [API Documentation](./API_DOCUMENTATION.md)
2. Check the [Architecture Documentation](./ARCHITECTURE.md)
3. Review error logs in terminal
4. Check browser console (F12)

## License

MIT License - See LICENSE file for details

