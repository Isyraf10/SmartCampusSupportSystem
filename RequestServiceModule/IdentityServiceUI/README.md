# Identity Service UI - Frontend

React-based frontend for the Identity Service (Smart Campus System).

## Features

- 🔐 User Login
- 📝 User Registration
- 🎓 Support for Student/Staff/Admin roles
- 🔄 Redirects to Facility Service Dashboard after login
- 💾 Token management (localStorage)
- 🎨 Beautiful UI with gradient backgrounds

## Setup

### Installation

```bash
npm install
```

### Environment Variables

Create or update `.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_FACILITY_SERVICE_URL=http://localhost:5001
```

### Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Architecture

```
src/
├── pages/
│   ├── Login.jsx          # Login page
│   ├── Register.jsx       # Registration page
│   └── AuthPages.css      # Shared styling
├── components/
├── context/
│   └── AuthContext.jsx    # Global auth state
├── services/
│   └── authService.js     # API service
├── App.jsx                # Main app component
└── main.jsx               # Entry point
```

## User Flow

1. **User visits**: `http://localhost:3000`
2. **Redirected to**: `/login` page
3. **Choose**: Login or Register
4. **On success**: Redirects to `http://localhost:5001/dashboard` (Facility Service)
5. **Token stored**: In localStorage for future requests

## API Integration

This frontend communicates with:

- **Identity Service**: `http://localhost:5000/api/v1`
  - POST `/auth/register` - Register new user
  - POST `/auth/login` - Login user
  - POST `/auth/verify-token` - Verify JWT token

## Features

### Login Page
- Email and password input
- Error handling
- Link to registration page
- Redirects to Facility Service after success

### Registration Page
- Full name input
- Email input
- Password confirmation
- Matric number (optional)
- User type selection (Student/Staff/Admin)
- Form validation
- Link to login page

## Token Management

- **Access Token**: Stored in localStorage
- **Refresh Token**: Stored in localStorage
- **User Data**: Stored in localStorage
- **Auto-logout**: On token expiration

## Security Notes

- Tokens stored in localStorage (consider upgrading to HttpOnly cookies)
- CORS configured for Identity Service
- Environment variables for API URLs
- Password validation (min 8 characters)

## Next Steps

1. Start Identity Service: `npm run dev` (port 5000)
2. Start this UI: `npm run dev` (port 3000)
3. Test at: `http://localhost:3000/login`
