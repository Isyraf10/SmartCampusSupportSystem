# Notification Service — Smart Campus Support System (SCSS)

> CSE3433 Software Architecture | SOA Assignment | Semester II 2025/2026

## Service Overview

The **Notification Service** is a core component of the Smart Campus Support System, responsible for managing and delivering automated notifications to campus users.

**Port:** `5003`  
**Database:** MongoDB (`notification_db`)  
**Communicates with:** Identity Service (port `5000`)

---

## Project Structure

```
NotificationService/
├── backend/                        # Node.js + Express API
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── constants/
│   │   └── apiConstants.js         # API contracts & response format
│   ├── controllers/
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── authMiddleware.js       # Calls Identity Service to verify token
│   ├── models/
│   │   └── Notification.js         # MongoDB schema
│   ├── routes/
│   │   └── notificationRoutes.js
│   ├── utils/
│   │   └── errorHandler.js         # Centralized error handling
│   ├── server.js                   # Entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/                       # React + Vite UI
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx     # Auth state management
    │   ├── pages/
    │   │   ├── Login.jsx           # Login page
    │   │   ├── Dashboard.jsx       # Main notifications page
    │   │   └── Pages.css           # UMT-themed styles
    │   ├── services/
    │   │   └── notificationService.js  # API calls
    │   ├── App.jsx                 # Router
    │   └── main.jsx                # Entry point
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/health` | Public | Health check |
| GET | `/api/v1/notifications/my` | Protected | Get my notifications |
| DELETE | `/api/v1/notifications/my/all` | Protected | Clear all my notifications |
| GET | `/api/v1/notifications/:id` | Protected | Get notification by ID |
| PUT | `/api/v1/notifications/:id/read` | Protected | Mark as read |
| DELETE | `/api/v1/notifications/:id` | Protected | Delete notification |
| GET | `/api/v1/notifications` | Admin | Get all notifications |
| POST | `/api/v1/notifications/send` | Admin | Send notification |

---

## Setup & Run

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## SOA Integration

This service calls the **Identity Service** (`POST /api/v1/auth/verify-token`) to verify JWT tokens on every protected request.

```
Client → Notification Service → Identity Service (token verify)
                             ↓
                         MongoDB (notification_db)
```

---

## Team Member

| Name | Matric | Role |
|------|--------|------|
| Muhammad Dini bin Mohamad Yusabri | S75909 | Event & Notification Service |
