# StockMaster IMS - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication via JWT Bearer token.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STAFF"  // Optional: ADMIN, MANAGER, STAFF (default: STAFF)
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STAFF",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
**POST** `/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STAFF"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
**GET** `/auth/me`

Get details of the currently authenticated user.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-10T08:00:00.000Z"
  }
}
```

---

## Product Endpoints

### List Products
**GET** `/products`

Get all products with optional filters.

**Query Parameters:**
- `category` (string) - Filter by category
- `search` (string) - Search in name or SKU code
- `isActive` (boolean) - Filter active/inactive products

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "uuid",
      "name": "Laptop Dell XPS 15",
      "skuCode": "DELL-XPS15-001",
      "description": "High-performance laptop",
      "category": "Electronics",
      "uom": "pcs",
      "reorderLevel": 5,
      "isActive": true,
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-10T08:00:00.000Z"
    }
  ]
}
```

### Get Single Product
**GET** `/products/:id`

Get detailed information about a specific product, including stock levels.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Laptop Dell XPS 15",
    "skuCode": "DELL-XPS15-001",
    "description": "High-performance laptop",
    "category": "Electronics",
    "uom": "pcs",
    "reorderLevel": 5,
    "isActive": true,
    "stockLevels": [
      {
        "id": "uuid",
        "quantity": 25,
        "location": {
          "id": "uuid",
          "name": "Main Warehouse",
          "type": "WAREHOUSE"
        }
      }
    ]
  }
}
```

### Create Product
**POST** `/products`

Create a new product. Requires MANAGER or ADMIN role.

**Request Body:**
```json
{
  "name": "Laptop Dell XPS 15",
  "skuCode": "DELL-XPS15-001",
  "description": "High-performance laptop",
  "category": "Electronics",
  "uom": "pcs",
  "reorderLevel": 5
}
```

**Response:** `201 Created`

### Update Product
**PUT** `/products/:id`

Update an existing product. Requires MANAGER or ADMIN role.

**Request Body:** (same as create, all fields optional)

**Response:** `200 OK`

### Delete Product
**DELETE** `/products/:id`

Soft delete a product (sets `isActive` to false). Requires ADMIN role.

**Response:** `200 OK`

---

## Operation Endpoints

### Create Receipt (Incoming Stock)
**POST** `/operations/receipt`

Create a new receipt for incoming stock.

**Request Body:**
```json
{
  "productId": "uuid",
  "locationId": "uuid",  // Destination location
  "quantity": 50,
  "documentNumber": "PO-2024-001",  // Optional
  "notes": "Supplier: ABC Corp"     // Optional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "productId": "uuid",
    "destinationLocationId": "uuid",
    "quantity": 50,
    "documentType": "RECEIPT",
    "documentNumber": "PO-2024-001",
    "status": "DRAFT",
    "notes": "Supplier: ABC Corp",
    "createdBy": "uuid",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Create Delivery (Outgoing Stock)
**POST** `/operations/delivery`

Create a new delivery for outgoing stock.

**Request Body:**
```json
{
  "productId": "uuid",
  "locationId": "uuid",  // Source location
  "quantity": 20,
  "documentNumber": "SO-2024-001",
  "notes": "Customer: XYZ Ltd"
}
```

**Response:** `201 Created`

### Create Internal Transfer
**POST** `/operations/transfer`

Create a new internal transfer between locations.

**Request Body:**
```json
{
  "productId": "uuid",
  "sourceLocationId": "uuid",
  "destinationLocationId": "uuid",
  "quantity": 10,
  "notes": "Moving to Rack B for easier access"
}
```

**Response:** `201 Created`

### Validate Operation ⚡ (CRITICAL)
**POST** `/operations/validate/:moveId`

Validate an operation and update stock levels. This is the critical endpoint that modifies inventory.

**Path Parameters:**
- `moveId` (string) - The ID of the operation to validate

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Operation validated successfully",
  "data": {
    "id": "uuid",
    "productId": "uuid",
    "destinationLocationId": "uuid",
    "quantity": 50,
    "documentType": "RECEIPT",
    "status": "VALIDATED",
    "validatedAt": "2024-01-15T10:35:00.000Z",
    "product": {
      "name": "Laptop Dell XPS 15",
      "skuCode": "DELL-XPS15-001"
    },
    "destinationLocation": {
      "name": "Main Warehouse"
    }
  }
}
```

**Error Scenarios:**
- `400` - Operation already validated
- `400` - Operation cancelled
- `400` - Insufficient stock (for deliveries)
- `404` - Operation not found

### List Operations
**GET** `/operations`

Get all operations with optional filters.

**Query Parameters:**
- `productId` (string) - Filter by product
- `documentType` (string) - RECEIPT, DELIVERY, INTERNAL_TRANSFER
- `status` (string) - DRAFT, VALIDATED, CANCELLED
- `limit` (number) - Limit results (default: 50)

**Response:** `200 OK`

### Get Single Operation
**GET** `/operations/:moveId`

Get details of a specific operation.

**Response:** `200 OK`

### Cancel Operation
**DELETE** `/operations/:moveId`

Cancel an operation. Only works for DRAFT operations.

**Response:** `200 OK`

---

## Inventory Endpoints

### Get Stock Levels
**GET** `/inventory/stock-levels`

Get current stock levels across all locations.

**Query Parameters:**
- `productId` (string) - Filter by product
- `locationId` (string) - Filter by location
- `minQuantity` (number) - Filter stocks above quantity

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "uuid",
      "quantity": 75,
      "updatedAt": "2024-01-15T10:35:00.000Z",
      "product": {
        "name": "Laptop Dell XPS 15",
        "skuCode": "DELL-XPS15-001",
        "uom": "pcs"
      },
      "location": {
        "name": "Main Warehouse",
        "type": "WAREHOUSE"
      }
    }
  ]
}
```

### Get Stock Ledger
**GET** `/inventory/stock-ledger`

Get stock movement history.

**Query Parameters:**
- `productId` (string)
- `locationId` (string)
- `documentType` (string)
- `status` (string)
- `limit` (number)

**Response:** `200 OK`

### Get Low Stock Alerts
**GET** `/inventory/low-stock`

Get products below their reorder level.

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "uuid",
      "quantity": 3,
      "product": {
        "name": "Laptop Dell XPS 15",
        "skuCode": "DELL-XPS15-001",
        "reorderLevel": 5,
        "uom": "pcs"
      },
      "location": {
        "name": "Main Warehouse"
      }
    }
  ]
}
```

---

## Dashboard Endpoints

### Get KPIs
**GET** `/dashboard/kpis`

Get key performance indicators for the dashboard.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalProducts": 150,
    "totalLocations": 8,
    "pendingReceipts": 5,
    "pendingDeliveries": 3,
    "lowStockCount": 7,
    "totalStockItems": 5234,
    "recentMoves": [
      // ... last 10 operations
    ]
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

**Development Mode:**
Error responses include a `stack` field with the error stack trace.

