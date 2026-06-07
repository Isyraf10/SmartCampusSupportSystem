# Identity Service - Smart Campus System

## Service-Oriented Architecture (SOA) Implementation

Welcome to the **Identity Service** - the authentication and authorization entry point for the Smart Campus System.

---

## 📋 Project Overview

### Service Purpose
The Identity Service is responsible for:
- ✅ User registration and authentication
- ✅ JWT token generation and validation
- ✅ User profile management
- ✅ Role-based access control (RBAC)
- ✅ API contract enforcement for other services

### SOA Principles Applied
- **Loose Coupling**: Each service has independent database
- **API Contracts**: Standardized request/response format
- **Business Services**: Domain-specific service responsibility
- **REST APIs**: HTTP/REST communication between services
- **Service Independence**: No shared business logic or databases

---

## 📁 Project Structure

```
IdentityService/
├── config/
│   └── db.js                          # MongoDB connection configuration
├── constants/
│   └── apiConstants.js               # API contracts & standardized messages
├── controllers/
│   ├── authController.js             # Authentication logic handlers
│   └── userController.js             # User management handlers
├── middleware/
│   └── authMiddleware.js             # JWT verification & authorization
├── models/
│   └── User.js                       # User data model (Mongoose schema)
├── routes/
│   ├── authRoutes.js                # Authentication endpoints
│   └── userRoutes.js                # User management endpoints
├── services/
│   └── userService.js               # Business logic for user operations
├── utils/
│   ├── errorHandler.js              # Centralized error handling
│   ├── jwtUtils.js                  # JWT generation & verification
│   └── passwordUtils.js             # Password hashing & validation
├── .env                              # Environment configuration
├── API_CONTRACT.js                  # API documentation for other services
├── package.json                     # Project dependencies
├── README.md                        # This file
└── server.js                        # Main application entry point
```

### Folder Responsibilities

| Folder | Purpose |
|--------|---------|
| `config/` | Database and service configuration |
| `constants/` | API contracts, routes, response formats |
| `controllers/` | Request handlers (thin layer) |
| `middleware/` | Authentication and authorization |
| `models/` | Data schemas (Mongoose) |
| `routes/` | API endpoint definitions |
| `services/` | Business logic and data operations |
| `utils/` | Shared utilities (JWT, passwords, errors) |

---

## 🔧 Setup & Installation

### Prerequisites
- **Node.js** v14+ and **npm**
- **MongoDB** running locally (use MongoDB Compass)
- **Port 5000** available (or configure via `.env`)

### 1. Clone/Navigate to Project
```bash
cd IdentityService
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create or update `.env` file:
```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/smart-campus-identity

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production_2024

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Other Service URLs (for future integration)
IT_SERVICE_URL=http://localhost:5001
FACILITY_SERVICE_URL=http://localhost:5002
NOTIFICATION_SERVICE_URL=http://localhost:5003
```

### 4. Setup MongoDB
- Open **MongoDB Compass**
- Ensure it's running on `mongodb://localhost:27017`
- Database `smart-campus-identity` will be created automatically

### 5. Start the Service
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Expected output:
```
============================================================
✓ Identity Service is running
✓ Port: 5000
✓ Environment: development
✓ Database: mongodb://localhost:27017/smart-campus-identity

Endpoints:
  - Health: http://localhost:5000/api/v1/health
  - Auth: http://localhost:5000/api/v1/auth
  - Users: http://localhost:5000/api/v1/users
============================================================
```

---

## 🔌 API Endpoints

### Health Check
```http
GET /api/v1/health
```
Response:
```json
{
  "status": "UP",
  "service": "Identity Service",
  "timestamp": "2024-06-01T12:00:00Z",
  "uptime": 123.456
}
```

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "matricNumber": "AD123456",
  "role": "student"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "status": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### User Management Endpoints (Protected)

#### Get Own Profile
```http
GET /api/v1/users/profile/me
Authorization: Bearer <accessToken>
```

#### Get All Users (Admin Only)
```http
GET /api/v1/users?role=student
Authorization: Bearer <adminToken>
```

#### Update User
```http
PUT /api/v1/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "matricNumber": "AD654321"
}
```

#### Delete User (Admin Only)
```http
DELETE /api/v1/users/:id
Authorization: Bearer <adminToken>
```

#### Change Password
```http
POST /api/v1/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "CurrentPass123",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure

**Access Token** (1 hour validity)
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "student",
  "name": "John Doe",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Refresh Token** (7 days validity)
```json
{
  "id": "user_id",
  "iat": 1234567890,
  "exp": 1234656890
}
```

### Using Tokens
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### User Roles
| Role | Permissions |
|------|------------|
| `student` | View own profile, change password |
| `staff` | View own profile, change password |
| `admin` | Full access to all users and operations |

---

## 🔗 Integration with Other Services

### For IT Service, Facility Service, Notification Service

#### 1. Verify User Token
```javascript
const axios = require('axios');

async function verifyUserToken(token) {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/v1/auth/verify-token',
      {},
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data.data.user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

#### 2. Get User Details
```javascript
async function getUserDetails(userId, adminToken) {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/v1/users/${userId}`,
      {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }
    );
    return response.data.data;
  } catch (error) {
    throw new Error('User not found');
  }
}
```

#### 3. Response Format (Standardized)
All Identity Service responses follow this contract:
```json
{
  "success": true/false,
  "status": 200,
  "message": "Operation description",
  "data": { /* actual data */ },
  "timestamp": "2024-06-01T12:00:00Z"
}
```

---

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (hashed, not returned by default),
  matricNumber: String (optional, unique),
  role: String (enum: ['student', 'staff', 'admin']),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Indexes
- Email (unique)
- Role
- Created date (descending)

---

## 🛠️ Service Architecture

### Request Flow
```
Request → CORS Middleware → Body Parser → Auth Routes
   ↓
Auth Controller → User Service → User Model → MongoDB
   ↓
Error Handler → Response Contract → Client
```

### Separation of Concerns
- **Routes**: Define endpoints
- **Controllers**: Handle HTTP requests (thin layer)
- **Services**: Business logic
- **Models**: Data schema
- **Middleware**: Cross-cutting concerns
- **Utils**: Shared functions

---

## ✅ Best Practices Implemented

1. **No Shared Databases**: Each service has its own MongoDB database
2. **API Contracts**: Standardized response format
3. **Error Handling**: Centralized error handling
4. **Security**: Password hashing, JWT validation
5. **Validation**: Input validation and sanitization
6. **Middleware**: Organized middleware layers
7. **Environment Config**: Sensitive data in `.env`
8. **Logging**: Request logging

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Token blacklisting for logout
- [ ] Email verification
- [ ] Two-factor authentication (2FA)
- [ ] Audit logging
- [ ] Rate limiting
- [ ] Service-to-service authentication (mTLS)
- [ ] Role-based access control refinement
- [ ] User activity tracking

---

## 🧪 Testing

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/v1/users/profile/me \
  -H "Authorization: Bearer <accessToken>"
```

---

## 📝 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017/smart-campus-identity` | MongoDB connection string |
| `PORT` | `5000` | Server port |
| `JWT_SECRET` | - | Secret key for access tokens (REQUIRED) |
| `JWT_REFRESH_SECRET` | - | Secret key for refresh tokens (REQUIRED) |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGIN` | `*` | CORS allowed origins |

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify database permissions

### JWT Token Errors
- Ensure `JWT_SECRET` is set in `.env`
- Check token hasn't expired
- Verify Authorization header format: `Bearer <token>`

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process: `netstat -ano | findstr :5000`

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `constants/apiConstants.js` | API routes and response contracts |
| `utils/errorHandler.js` | Centralized error handling |
| `services/userService.js` | Core business logic |
| `middleware/authMiddleware.js` | Authentication & authorization |
| `API_CONTRACT.js` | Complete API documentation |

---

## 📞 Support

For issues or questions:
1. Check the logs in terminal
2. Review `.env` configuration
3. Verify MongoDB connection
4. Check API_CONTRACT.js for endpoint details

---

## 🎯 Remember

This Identity Service is designed as a **standalone microservice** with:
- ✅ Independent database
- ✅ Standardized API contracts
- ✅ Clear separation of concerns
- ✅ Loose coupling for other services
- ✅ REST API communication

Other services (IT, Facility, Notification) should:
1. **Never** share this database
2. **Always** verify tokens via this service
3. **Follow** the same response contract pattern
4. **Communicate** via REST APIs only

---

**Created**: June 2024
**Version**: 1.0.0
**Architecture**: Service-Oriented Architecture (SOA)
