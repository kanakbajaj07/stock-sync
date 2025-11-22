# StockMaster Frontend

React frontend application for the StockMaster Inventory Management System.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Server state
- **Zustand** - Client state
- **React Hook Form** - Forms
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Application runs at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/
│   │   ├── common/     # Reusable components
│   │   ├── layouts/    # Layout components
│   │   └── features/   # Feature-specific components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── stores/         # Zustand stores
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilities
│   ├── styles/         # Global styles
│   ├── App.jsx         # App component
│   └── main.jsx        # Entry point
├── index.html
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run format` - Format code

## Features

### Responsive Design
- Mobile-first approach
- Works on desktop, tablet, and mobile
- Optimized for warehouse staff on mobile devices

### Authentication
- JWT-based authentication
- Protected routes
- Role-based UI rendering

### Real-time Updates
- React Query for automatic refetching
- Optimistic updates
- Cache management

### Form Handling
- React Hook Form for performance
- Client-side validation
- Error handling

## Styling

Uses Tailwind CSS with custom utility classes defined in `src/styles/index.css`:

- `.btn`, `.btn-primary`, `.btn-secondary`, etc.
- `.card`
- `.input`, `.input-error`
- `.badge`, `.badge-success`, `.badge-warning`, etc.
- `.table`

## State Management

### Auth Store (Zustand)
- User authentication state
- Persisted to localStorage
- Located in `src/stores/authStore.js`

### Server State (React Query)
- API data caching
- Automatic refetching
- Loading/error states

## API Integration

All API calls are in `src/services/`:
- `authService.js` - Authentication
- `productService.js` - Products
- `operationService.js` - Stock operations
- `inventoryService.js` - Inventory
- `locationService.js` - Locations
- `dashboardService.js` - Dashboard

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## Build for Production

```bash
npm run build
```

Output in `dist/` directory.

