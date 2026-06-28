# EcoSynergy 🌿

A full-stack web platform for organizing and coordinating community-driven environmental initiatives. Citizens can create, discover, and join sustainability drives, chat in real-time, collaboratively track impact, and get AI-powered guidance — all in one place.

**Team StackStorm ⚡** — Kartikeya Dimri (IMT2023126) · Ayush Mishra (IMT2023129) · Harsh Sinha (IMT2023571)

## Features

- 🌱 **Community Drives** — Create, browse, join, and manage environmental initiatives
- 💬 **Real-time Discussion** — Socket-powered per-drive chat with typing indicators
- 📊 **Collaborative Impact Board** — Multi-user editor with live cursor tracking
- 🤖 **AI Eco-Bot** — Waste-management & sustainability chat assistant
- 📝 **AI Summaries** — Auto-generated summaries for completed drives
- 🔐 **OAuth Login** — Google & Microsoft sign-in via Passport.js

## Tech Stack

- **Frontend:** React 19, Vite 7, MUI v7, Tailwind CSS v4, Socket.IO Client, Three.js
- **Backend:** Node.js, Express, MongoDB (Mongoose), Redis (ioredis), Socket.IO, Passport.js, Joi, Cloudinary

## Running Locally

### Prerequisites

- Node.js ≥ 18
- MongoDB (Atlas or local)
- Redis (local or hosted)

### Backend

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
BACKEND_PORT=8080
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/ecosynergy
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379
```

```bash
node index.js
```

### Frontend

```bash
cd Frontend
npm install
```

Create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
VITE_FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

## License

ISC
