# Event & Notification Service
### Smart Campus Support System (SCSS) — SOA
**Port:** `5004`  
**Identity Service:** `http://localhost:5000`

---

## Setup & Run

```bash
cd notification-service
npm install
npm run dev
```

---

## API Endpoints

### General
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | None | Welcome message |
| GET | `/api/v1/health` | None | Health check |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/events` | None | Get all events |
| GET | `/api/v1/events/:id` | None | Get event by ID |
| POST | `/api/v1/events` | Admin | Create new event |
| PUT | `/api/v1/events/:id` | Admin | Update event |
| DELETE | `/api/v1/events/:id` | Admin | Delete event |
| POST | `/api/v1/events/:id/register` | Protected | Register for event |
| DELETE | `/api/v1/events/:id/register` | Protected | Cancel registration |
| GET | `/api/v1/events/:id/registrations` | Admin | View all registrations |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/notifications/my` | Protected | Get my notifications |
| PUT | `/api/v1/notifications/:id/read` | Protected | Mark as read |
| DELETE | `/api/v1/notifications/:id` | Protected | Delete notification |
| GET | `/api/v1/notifications` | Admin | Get all notifications |
| POST | `/api/v1/notifications/send` | Admin | Send manual notification |

---

## SOA Integration with Identity Service

Protected routes call `POST http://localhost:5000/api/v1/auth/verify-token` to validate JWT tokens.

Pass token in request header:
```
Authorization: Bearer <your_token>
```

---

## Project Structure

```
notification-service/
├── src/
│   ├── server.js                    # Entry point
│   ├── app.js                       # Express app & routes setup
│   ├── routes/
│   │   ├── eventRoutes.js           # Event route definitions
│   │   └── notificationRoutes.js    # Notification route definitions
│   ├── controllers/
│   │   ├── eventController.js       # Event business logic
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── authMiddleware.js        # Calls Identity Service to verify token
│   ├── models/
│   │   └── db.js                    # In-memory database (prototype)
│   └── services/
│       └── notificationHelper.js    # Simulates RabbitMQ notification sending
├── .env
├── package.json
└── README.md
```
