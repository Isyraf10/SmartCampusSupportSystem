# Notification Service Module

Part of Smart Campus Support System (SOA)

## Structure
```
NotificationServiceModule/
├── NotificationService/        # Backend (Node.js/Express) — Port 5003
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── .env
│   └── package.json
└── NotificationServiceUI/      # Frontend (React/Vite) — Port 3001
    ├── src/
    │   ├── context/AuthContext.jsx
    │   ├── pages/Dashboard.jsx
    │   └── services/notificationService.js
    ├── .env
    └── package.json
```

## Prerequisites
- RequestServiceModule (IdentityService) running on port 5000
- MongoDB running on port 27017

## Quick Start

### 1. Start Identity Service (RequestServiceModule)
```bash
cd RequestServiceModule/IdentityService
node server.js
```

### 2. Start Notification Service Backend
```bash
cd NotificationService
npm install
node server.js
```

### 3. Start Notification Service Frontend
```bash
cd NotificationServiceUI
npm install
npm run dev
```

## How Authentication Works (SOA)
1. User logs in via RequestServiceModule UI (port 3000)
2. Token stored in localStorage as `accessToken`
3. NotificationServiceUI reads token from localStorage
4. Every API call sends token to NotificationService
5. NotificationService calls IdentityService to verify token
6. If valid, request proceeds

## API Endpoints
- GET    /api/v1/notifications/my        — Get my notifications
- GET    /api/v1/notifications           — Get all (admin only)
- POST   /api/v1/notifications/send      — Send notification (admin only)
- PUT    /api/v1/notifications/:id/read  — Mark as read
- DELETE /api/v1/notifications/:id       — Delete notification
- DELETE /api/v1/notifications/my/all    — Clear all my notifications
