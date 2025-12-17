# EventFlow

<p align="center">
  <img src="https://img.shields.io/badge/MongoDB-023430?style=for-the-badge&logo=mongodb&logoColor=47A248" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express-0B0F14?style=for-the-badge&logo=express&logoColor=FFFFFF" alt="Express" />
  <img src="https://img.shields.io/badge/React-0B1F2E?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-0B2E1B?style=for-the-badge&logo=node.js&logoColor=3C873A" alt="Node.js" />
  <img src="https://img.shields.io/badge/TailwindCSS-0B1F2E?style=for-the-badge&logo=tailwindcss&logoColor=38B2AC" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-1A1033?style=for-the-badge&logo=vite&logoColor=FFD34D" alt="Vite" />
  <img src="https://img.shields.io/badge/Mongoose-2D0A0A?style=for-the-badge&logo=mongoose&logoColor=880000" alt="Mongoose" />
  <img src="https://img.shields.io/badge/Cloudinary-0B1F2E?style=for-the-badge&logo=cloudinary&logoColor=2C93E8" alt="Cloudinary" />
</p>

<p align="center">
  A modern MERN platform for managing events with secure auth, image uploads, RSVP concurrency safety, and optional AI-assisted descriptions.
</p>

<p align="center">
  <a href="https://event-managment-assignment.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20App-0F172A?style=for-the-badge&logo=vercel&logoColor=white" alt="Live App" />
  </a>
  <a href="https://event-managment-assignment.onrender.com">
    <img src="https://img.shields.io/badge/Backend-0B2E1B?style=for-the-badge&logo=render&logoColor=white" alt="Backend" />
  </a>
  <a href="https://github.com/Arbab-ofc/event-managment-assignment">
    <img src="https://img.shields.io/badge/Repository-0B0F14?style=for-the-badge&logo=github&logoColor=white" alt="Repository" />
  </a>
</p>

---

## Highlights
- JWT authentication with protected routes
- Event creation with Cloudinary uploads
- RSVP system using MongoDB transactions for concurrency safety
- Dashboard for created and attending events
- Profile management with avatar uploads and strong password validation
- Optional AI enhancement (OpenAI or OpenRouter)
- Responsive UI with dark mode and toast notifications

## Demo Account
- Email: `demouser123@gmail.com`
- Password: `User@123`

---

## Tech Stack
**Backend**
- Node.js, Express.js
- MongoDB Atlas, Mongoose
- JWT, bcrypt
- Cloudinary, multer

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- React Context

**Dev Tools**
- ESLint
- Nodemon

---

## Project Structure
```
/server
  /src
    /controllers
    /middlewares
    /models
    /routes
    /services
    /utils
    index.js
  .env.example
  package.json

/client
  /src
    /api
    /components
    /context
    /hooks
    /pages
    /utils
    App.jsx
    main.jsx
    index.css
  tailwind.config.js
  postcss.config.js
  vite.config.js
  .env.example
  package.json
```

---

## Environment Variables
### Backend (`server/.env`)
- `PORT`: Server port.
- `MONGODB_URI`: MongoDB Atlas connection string.
- `JWT_SECRET`: Secret used to sign JWTs.
- `JWT_EXPIRES_IN`: Token expiration (example: `7d`).
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name.
- `CLOUDINARY_API_KEY`: Cloudinary API key.
- `CLOUDINARY_API_SECRET`: Cloudinary API secret.
- `CLOUDINARY_UPLOAD_PRESET`: Optional unsigned upload preset name.
- `CLIENT_URL`: Frontend URL for CORS.
- `OPENAI_API_KEY`: Optional key for AI description enhancement.
- `OPENAI_MODEL`: Optional model override (example: `openai/gpt-oss-120b:free`).

### Frontend (`client/.env`)
- `VITE_API_BASE_URL`: Backend base URL including `/api`.

---

## Database Schema
### User
- `name`: string, required
- `email`: string, required, unique, lowercase
- `password`: string, required, bcrypt hashed
- `avatarUrl`: string, optional
- timestamps

### Event
- `title`: string, required, 3-100 chars
- `description`: string, required, max 2000 chars
- `dateTime`: Date, required, must be in the future on create
- `location`: string, required
- `capacity`: number, required, min 1
- `rsvpCount`: number, default 0
- `imageUrl`: string, required
- `category`: string, optional
- `createdBy`: ObjectId ref User
- timestamps

### RSVP
- `event`: ObjectId ref Event
- `user`: ObjectId ref User
- unique index on `(event, user)`
- createdAt timestamp

---

## Validation Rules
### Auth
- Email must be valid format.
- Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.

### Events
- Title length: 3-100
- Description max: 2000 chars
- Date/time must be in the future
- Capacity min: 1

### Profile
- Name required
- Password follows strong rules if provided
- Avatar accepts image uploads

---

## UI Pages
- **Events List**: search, category filter, date range filter
- **Event Detail**: full details, RSVP join/leave, edit/delete for owner
- **Create Event**: full form with image upload and AI helper
- **Edit Event**: update fields and optional image replacement
- **Dashboard**: created events and attending events
- **Profile**: update name, password, avatar
- **Auth**: login and register with validations and show/hide password

---

## API Endpoints
### Auth
- `POST /api/auth/register` Register a new user
- `POST /api/auth/login` Login and receive JWT
- `GET /api/auth/me` Get current user

### Events
- `POST /api/events` Create event with image upload (multipart)
- `GET /api/events` List upcoming events with filters
- `GET /api/events/:id` Event details with RSVP state
- `PUT /api/events/:id` Update event
- `DELETE /api/events/:id` Delete event and RSVPs

### RSVP
- `POST /api/events/:id/rsvp` RSVP to event
- `DELETE /api/events/:id/rsvp` Cancel RSVP

### Users
- `GET /api/users/me/events` Dashboard data
- `PUT /api/users/me` Update name, password, avatar

### AI
- `POST /api/ai/enhance-description` Generate event description

---

## Concurrency Strategy
RSVP join and leave operations use MongoDB transactions and a unique compound index to prevent double RSVPs and overbooking under concurrent requests.

---

## Local Development
### Backend
```
cd server
npm install
cp .env.example .env
npm run dev
```

### Frontend
```
cd client
npm install
cp .env.example .env
npm run dev
```

---

## Deployment
### Backend on Render
- Build command: `npm install`
- Start command: `npm start`
- Set all server environment variables

### Frontend on Vercel
- Framework preset: Vite
- Set `VITE_API_BASE_URL`

---

## Usage Flow
1. Register or use demo credentials.
2. Create an event with a cover image.
3. Browse events and RSVP.
4. Track activity in the dashboard.
5. Update your profile and avatar.

---

## Contact
<p align="left">
  <a href="https://www.linkedin.com/in/arbab-ofc/">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="https://github.com/Arbab-ofc">
    <img src="https://img.shields.io/badge/GitHub-0B0F14?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="https://arbabprvt.great-site.net/">
    <img src="https://img.shields.io/badge/Portfolio-111827?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio" />
  </a>
</p>
