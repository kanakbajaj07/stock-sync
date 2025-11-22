# User Role Assignment Guide
# StockMaster IMS

## 🔐 How Role Assignment Works (Security Model)

### **Important: Users DO NOT Select Their Own Roles**

For security reasons, users cannot choose their own role during registration. Roles are assigned by administrators.

---

## 📋 Role Assignment Flow

### 1. **Public Registration (Self-Service)**

When users register through the public registration page:

```
User registers → Automatically assigned "STAFF" role → Can access limited features
```

**Why STAFF by default?**
- Least privileged access (security principle)
- Admins can upgrade users later
- Prevents unauthorized access to management features

### 2. **Admin-Created Users (Manual Assignment)**

Administrators can create users with specific roles through the admin panel:

```
Admin logs in → User Management → Create User → Select Role → User created with assigned role
```

**Available roles:**
- `ADMIN` - Full system access
- `MANAGER` - Inventory management
- `STAFF` - Warehouse operations

---

## 🎯 How to Assign/Change User Roles

### **Method 1: Using Admin Panel (Frontend - Coming Soon)**

1. Login as ADMIN user
2. Navigate to **User Management** (Settings → Users)
3. Find the user you want to modify
4. Click **Edit** or **Change Role**
5. Select new role from dropdown
6. Click **Save**

### **Method 2: Using API (Current Method)**

#### **A. Create User with Specific Role**

**Endpoint:** `POST /api/users`  
**Access:** ADMIN only  
**Headers:** 
```json
{
  "Authorization": "Bearer YOUR_ADMIN_TOKEN"
}
```

**Body:**
```json
{
  "email": "manager@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Manager",
  "role": "MANAGER"
}
```

**Example with cURL:**
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "newmanager@stockmaster.com",
    "password": "password123",
    "firstName": "New",
    "lastName": "Manager",
    "role": "MANAGER"
  }'
```

#### **B. Change Existing User's Role**

**Endpoint:** `PATCH /api/users/:userId/role`  
**Access:** ADMIN only

**Body:**
```json
{
  "role": "MANAGER"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:5001/api/users/USER_ID_HERE/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"role": "MANAGER"}'
```

#### **C. Get All Users (To Find User IDs)**

**Endpoint:** `GET /api/users`  
**Access:** ADMIN only

```bash
curl -X GET http://localhost:5001/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### **D. Update User Details (Including Role)**

**Endpoint:** `PUT /api/users/:userId`  
**Access:** ADMIN only

**Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "updated@email.com",
  "role": "ADMIN",
  "isActive": true
}
```

---

## 🔑 Getting Admin Token for API Calls

### **Step 1: Login as Admin**

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@stockmaster.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@stockmaster.com",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Step 2: Copy the Token**

Copy the `token` value from the response.

### **Step 3: Use in Subsequent Requests**

Use the token in the `Authorization` header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Common Use Cases

### **Use Case 1: Promote STAFF to MANAGER**

**Scenario:** A warehouse staff member is promoted to manager.

**Steps:**
1. Login as ADMIN
2. Get user's ID from user list
3. Update role to MANAGER

```bash
# Get admin token first (login)
ADMIN_TOKEN="your_admin_token_here"

# Find the user
curl -X GET http://localhost:5001/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Update role (replace USER_ID)
curl -X PATCH http://localhost:5001/api/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"role": "MANAGER"}'
```

### **Use Case 2: Create New Manager Account**

**Scenario:** Hiring a new inventory manager.

```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "newmanager@company.com",
    "password": "temporaryPassword123",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "MANAGER"
  }'
```

### **Use Case 3: Deactivate a User (Without Deleting)**

**Scenario:** Employee leaves company.

```bash
curl -X PATCH http://localhost:5001/api/users/USER_ID/toggle-active \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### **Use Case 4: Reset User Password**

**Scenario:** User forgot password.

```bash
curl -X PATCH http://localhost:5001/api/users/USER_ID/reset-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"newPassword": "newSecurePassword123"}'
```

---

## 📊 Available API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | ADMIN |
| GET | `/api/users/:id` | Get single user | ADMIN |
| POST | `/api/users` | Create user (with role) | ADMIN |
| PUT | `/api/users/:id` | Update user details | ADMIN |
| PATCH | `/api/users/:id/role` | Change user role | ADMIN |
| PATCH | `/api/users/:id/toggle-active` | Activate/deactivate user | ADMIN |
| PATCH | `/api/users/:id/reset-password` | Reset user password | ADMIN |
| DELETE | `/api/users/:id` | Delete user | ADMIN |

---

## 🔒 Security Features

### **1. Role Validation**
- Only valid roles accepted: `ADMIN`, `MANAGER`, `STAFF`
- Invalid roles rejected with 400 error

### **2. Self-Protection**
- Admins cannot change their own role
- Admins cannot deactivate their own account
- Admins cannot delete their own account

### **3. Authentication Required**
- All endpoints require valid JWT token
- Token must be from ADMIN user

### **4. Email Uniqueness**
- Cannot create users with duplicate emails
- Email changes validated for uniqueness

### **5. Password Requirements**
- Minimum 6 characters
- Hashed with bcrypt before storage

---

## 🎓 Best Practices

### **DO:**
✅ Create MANAGER accounts for inventory supervisors  
✅ Let regular users register as STAFF  
✅ Promote users when responsibilities increase  
✅ Deactivate (not delete) users who leave  
✅ Use strong, unique passwords  
✅ Regularly review user roles and permissions  

### **DON'T:**
❌ Give ADMIN role to everyone  
❌ Share admin credentials  
❌ Create accounts with weak passwords  
❌ Delete users (deactivate instead for audit trail)  
❌ Allow users to select their own roles  

---

## 🧪 Testing Role Assignment

### **Test Scenario 1: Create New Manager**

```bash
# 1. Login as admin
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stockmaster.com","password":"password123"}'

# Save the token from response

# 2. Create manager account
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email":"testmanager@test.com",
    "password":"test123",
    "firstName":"Test",
    "lastName":"Manager",
    "role":"MANAGER"
  }'

# 3. Login with new manager account
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testmanager@test.com","password":"test123"}'

# 4. Verify role is MANAGER in response
```

### **Test Scenario 2: Promote STAFF to MANAGER**

```bash
# 1. Register as regular user (becomes STAFF)
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"staff@test.com",
    "password":"test123",
    "firstName":"Test",
    "lastName":"Staff"
  }'

# 2. Login as admin
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stockmaster.com","password":"password123"}'

# 3. Get all users to find staff user ID
curl -X GET http://localhost:5001/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 4. Promote to manager
curl -X PATCH http://localhost:5001/api/users/STAFF_USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"role":"MANAGER"}'

# 5. Login as promoted user and verify role changed
```

---

## 🚀 Future Enhancement: Admin Panel UI

The admin panel UI for user management is planned for future implementation:

**Features to include:**
- User list with search and filters
- Create user form with role selector
- Edit user modal
- Role change dropdown
- Activate/Deactivate toggle
- Password reset button
- User activity logs

**Location:** Will be at `/settings/users` (ADMIN only)

---

## 📞 Summary

**For Regular Users:**
- Register through public form → Automatically become STAFF
- Wait for admin to upgrade role if needed

**For Administrators:**
- Use API endpoints to create users with specific roles
- Change existing user roles via API
- Cannot modify own role (security)
- Admin panel UI coming in future update

**For Security:**
- Users never select their own roles
- All role changes logged (future feature)
- Roles enforced on both frontend and backend
- JWT tokens include role information

---

**Your inventory system now has enterprise-grade user role management!** 🔐

