# Quick Start Guide - Identity Service

## Step 1: Start the Backend (Identity Service)

```powershell
cd "C:\Users\isyra\Documents\$Sem 4\Software Architecture\ProjectAPI\IdentityService"
npm run dev
```

**Expected Output:**
```
✓ Server running on port 5000
✓ MongoDB connected
```

## Step 2: Start the Frontend

```powershell
cd "C:\Users\isyra\Documents\$Sem 4\Software Architecture\ProjectAPI\frontend"
python -m http.server 8000
```

**Expected Output:**
```
Serving HTTP on 0.0.0.0 port 8000
```

## Step 3: Open Browser

Navigate to: `http://localhost:8000`

You should see:
- Login page with email/password form
- "Create one here" link to registration page

## User Flow

### To Test Login:
1. Use existing user credentials (if any exist in MongoDB)
2. Click "Sign In"
3. Should redirect to `http://localhost:5001/dashboard` (Facility Service)

### To Test Registration:
1. Click "Create one here" on login page
2. Fill in registration form
3. Click "Create Account"
4. Should redirect to `http://localhost:5001/dashboard` (Facility Service)

## System Architecture

```
┌──────────────────────────────────────────┐
│   Frontend (HTML + Vanilla JS)           │
│   http://localhost:8000                  │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  index.html (Login Page)         │   │
│  │  register.html (Register Page)   │   │
│  │  js/login.js                     │   │
│  │  js/register.js                  │   │
│  └──────────────────────────────────┘   │
└─────────────────┬──────────────────────┘
                  │
        ┌─────────▼─────────┐
        │ POST /api/v1/auth │
        │ - /login          │
        │ - /register       │
        └─────────┬─────────┘
                  │
┌─────────────────▼─────────────────────────┐
│   Backend (Express.js + MongoDB)          │
│   http://localhost:5000                   │
│                                           │
│  Identity Service (Port 5000)             │
│  - User authentication                    │
│  - JWT token generation                   │
│  - User management                        │
└─────────────────┬─────────────────────────┘
                  │
        ┌─────────▼──────────┐
        │  Redirect to       │
        │  Facility Service  │
        │  (Port 5001)       │
        └────────────────────┘
```

## What Happens on Login

```
1. User enters email & password
   ↓
2. Frontend sends POST to http://localhost:5000/api/v1/auth/login
   ↓
3. Backend checks credentials in MongoDB
   ↓
4. If valid:
   - Backend generates JWT tokens
   - Backend responds with: { success: true, data: { user, accessToken, refreshToken } }
   ↓
5. Frontend stores tokens in localStorage
   ↓
6. Frontend redirects to http://localhost:5001/dashboard
```

## Checking MongoDB

```powershell
# Open MongoDB Compass
# Navigate to: localhost:27017
# Database: smart-campus-identity
# Collection: users
# View all registered users
```

## Troubleshooting

**Frontend shows CORS error:**
- Check that Identity Service is running on port 5000
- Check .env in IdentityService: `CORS_ORIGIN=*`

**Login fails with 400 error:**
- Check user exists in MongoDB
- Check email format
- Check password is at least 8 characters

**Tokens not stored:**
- Open Browser DevTools (F12)
- Check Application → Local Storage
- Should see: accessToken, refreshToken, user

**Redirect not working:**
- Check browser console for JavaScript errors
- Verify Facility Service is running on port 5001
- Check localStorage has tokens

## Testing Curl Commands

```bash
# Register a new user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123",
    "confirmPassword": "TestPassword123",
    "matricNumber": "SC123456",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

## Files Created

### Frontend Structure
```
frontend/
├── index.html              # Login page
├── register.html           # Registration page
├── js/
│   ├── login.js           # Login handler
│   └── register.js        # Register handler
├── README.md              # Frontend documentation
└── QUICKSTART.md          # This file
```

### Key Files to Know
- **index.html**: Login page (port 8000)
- **register.html**: Registration page
- **js/login.js**: Handles form submission & redirect
- **js/register.js**: Handles registration & redirect

## Next Steps

1. ✅ Backend (Identity Service) - Complete
2. ✅ Frontend (HTML + JS) - Complete
3. 🔄 Test end-to-end flow
4. Build Facility Service (port 5001)
5. Connect other services (IT, Notification)

## Ports Reference

```
3000  - React Frontend (IdentityServiceUI - alternative)
5000  - Identity Service (Authentication)
5001  - Facility Service (Dashboard)
5002  - IT Service
5003  - Notification Service
8000  - Simple Frontend (current)
```

## Need Help?

Check:
1. Browser Console (F12) - For JavaScript errors
2. Network Tab (F12) - For API responses
3. Backend Logs - Terminal output from Identity Service
4. MongoDB - Check if data is being stored
