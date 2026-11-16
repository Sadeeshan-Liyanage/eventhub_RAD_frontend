# EventHub — Event Management & Ticket Booking System

ITS2020 Rapid Application Development · Final Coursework (Graduate Diploma in Software Engineering, IJSE)

EventHub is a full-stack platform where **organizers** publish workshops, concerts and tech meetups, and **attendees** discover events, pick exact seats, pay at a (demo) checkout and keep digital tickets with QR codes. Organizers get an **analytics dashboard** with revenue, ticket sales and attendance metrics.

## Live links

| Part | URL |
| --- | --- |
| Frontend (Vercel) | `https://<your-app>.vercel.app` |
| Backend API (Render) | `https://<your-api>.onrender.com/api/health` |
| Database | MongoDB Atlas |

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Redux Toolkit, React Router, TailwindCSS v4, Axios, Recharts, qrcode.react
- **Backend:** Node.js, Express 4, TypeScript, Mongoose, Zod (validation), JWT, bcryptjs, Helmet, express-rate-limit
- **Database:** MongoDB (Atlas)
- **Deploy:** Vercel (client), Render (server), MongoDB Atlas

## Features

- **Ticket types** — organizers define their own ticket types (e.g. VIP, General, Student), each with its own price and seat count; attendees see per-type pricing and availability
- **Event discovery** — search, category filter, max price, sorting, pagination, live seat availability
- **Seat selection** — interactive seat map; seats are reserved with an atomic MongoDB update so two users can never book the same seat
- **Secure checkout** — demo payment form (card data is validated, never stored; only last 4 digits are kept)
- **Booking history & digital tickets** — QR-coded ticket page, print, cancel booking (seats are released)
- **Organizer tools** — create, edit, cancel and delete events
- **Advanced feature: Analytics dashboard** — total revenue, tickets sold, unique attendees, average occupancy, 30-day revenue chart, per-event sales vs capacity, attendee list per event
- **Auth & security** — JWT access token (15 min) + rotating refresh token (7 days, stored hashed), role-based authorization (`user`, `organizer`), bcrypt password hashing, `.env` secrets, rate-limited auth routes, input validation on every write

## Project structure

```
server/src
  config/       env + database connection
  models/       User, Event, Booking (Mongoose schemas, indexes)
  controllers/  auth, event, booking, analytics
  routes/       one router per resource
  middleware/   auth (protect/authorize), validate (Zod), errorHandler
  validators/   Zod schemas
  utils/        AppError, asyncHandler, tokens, response helper
client/src
  api/          axios instance + silent token refresh
  store/        Redux store + slices (auth, events, bookings, analytics)
  components/   Navbar, ProtectedRoute, EventCard, SeatMap, form fields
  pages/        Home, EventDetails, Login, Register, MyBookings, TicketPage,
                Dashboard, EventForm, Participants
```

## Local setup

Prerequisites: Node.js 20+, a MongoDB Atlas connection string (or local MongoDB).

```bash



# 1. Backend
cd server
npm install
cp .env.example .env        # then fill in MONGO_URI and the two JWT secrets
npm run seed                # optional: demo organizer, attendee and 4 events
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

Demo accounts after `npm run seed` (password `password123`):

- Organizer: `organizer@eventhub.test`
- Attendee: `user@eventhub.test`

Demo payment: any 16-digit card number works; a number ending in `0000` is declined.

## Environment variables




**server/.env**

| Key | Description |
| --- | --- |
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | long random strings (different from each other) |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | default `15m` / `7d` |
| `CLIENT_URL` | allowed frontend origin(s), comma separated |

**client/.env**

| Key | Description |
| --- | --- |
| `VITE_API_URL` | Backend base URL including `/api` |

## API overview


| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/register`, `/login`, `/refresh` | public |
| POST | `/api/auth/logout` · GET `/api/auth/me` | logged in |
| GET | `/api/events` (q, category, minPrice, maxPrice, sort, page, limit) | public |
| GET | `/api/events/:id` | public |
| GET | `/api/events/mine` | organizer |
| POST / PUT / DELETE | `/api/events`, `/api/events/:id` | organizer (owner) |
| PATCH | `/api/events/:id/cancel` | organizer (owner) |
| POST | `/api/bookings` | logged in |
| GET | `/api/bookings/mine`, `/api/bookings/:id` | owner (or event organizer) |
| PATCH | `/api/bookings/:id/cancel` | owner |
| GET | `/api/analytics/overview` | organizer |
| GET | `/api/analytics/events/:id/participants` | organizer (owner) |

All responses use `{ success, message?, data }` or `{ success: false, message, errors? }`.

## Deployment

1. **MongoDB Atlas** — create a free cluster, a database user, and allow network access (`0.0.0.0/0` for the demo). Copy the connection string.
2. **Backend on Render** — New Web Service from the GitHub repo, root directory `server`, build command `npm install && npm run build`, start command `npm start`. Add the env vars above (`CLIENT_URL` = your Vercel URL).
3. **Frontend on Vercel** — import the repo, root directory `client`, framework Vite. Add `VITE_API_URL=https://<your-api>.onrender.com/api`. (`vercel.json` already handles SPA routing.)
4. Put both live URLs and screenshots in this README.

## Screenshots




