# Frontend — EcoSynergy (client) 🌿

Team: StackStorm ⚡

Team Members: Kartikeya Dimri (IMT2023126), Ayush Mishra (IMT2023129), Harsh Sinha (IMT2023571)

This file documents only the frontend portion of the EcoSynergy project. It explains structure, key components, runtime scripts, environment variables, and developer tips so a reviewer or a teammate can quickly get the client running and understand where to find important code.

## Quick frontend overview 🔎
- Tech: React + Vite, Material-UI, Tailwind CSS
- Purpose: provide a responsive SPA where citizens can discover, join, and coordinate initiatives, chat in real-time, and interact with AI features.
- Real-time: socket.io-client is used to receive server events (drive create/join/leave/cancel, chat messages, impact updates).


## Where to start (quick)
```powershell
cd frontend
npm install
# set Vite env (VITE_API_URL) — see "Environment Variables" below
npm run dev
```
Open http://localhost:5173 in your browser (Vite default).


## Project layout (src) 🗂️
- `src/main.jsx` — React bootstrap and root rendering
- `src/App.jsx` — router definitions (React Router) and top-level route layout
- `src/context/SocketContext.jsx` — central socket provider and `useSocket()` hook used by pages/components
- `src/auth/` — authentication helpers
	- `ProtectedRoute.jsx` — route guard for authenticated areas
	- `TokenExpirationWatcher.jsx` — watches token expiry and logs out when expired
- `src/citizen/pages/` — main pages
	- `HomePage.jsx` — app landing for logged-in users
	- `CommunityInitiatives.jsx` — browse/join initiatives (uses real-time updates)
	- `MyInitiatives.jsx` — manage drives you created and view status
	- `AIChatPage.jsx` — chat with the waste-management AI assistant
	- `DiscussionForum.jsx` — per-drive chat + planning (socket-powered)
	- `ImpactBoard.jsx` — community impact feed (real-time)
	- `ViewSummary.jsx` — view final AI-generated summary for a drive
- `src/citizen/components/` — reusable UI components
	- `Navbar.jsx`, `InitiativeCard.jsx`, `NewInitiativeModal.jsx`, `ChatBox.jsx`, `RightCard.jsx`, etc.
- `src/utility/jwtDecoder.js` — small helper to parse JWT payload locally
- `src/index.css` — global styles and Tailwind base


## Key frontend concepts & files 📌
- Socket context (`src/context/SocketContext.jsx`)
	- Creates a single socket connection (socket.io-client) and exposes it via React Context.
	- Pages subscribe to socket events and update local state (e.g., `driveCreated`, `driveUpdated`, `driveCancelled`).

- Protected routes (`src/auth/ProtectedRoute.jsx`)
	- Guards citizen pages so only authenticated users can access them.
	- Works with JWT stored in `localStorage`.

- New initiative flow (`NewInitiativeModal.jsx`) and `CommunityInitiatives.jsx`
	- `NewInitiativeModal` contains the form and client-side validation for creating a drive.
	- On success the backend emits `driveCreated` and clients update without refresh.

- Chat/Discussion (`ChatBox.jsx`, `DiscussionForum.jsx`)
	- Uses both Socket events and the backend's chat persistence to display messages in real time.
	- Redis is used on the backend (see backend docs) to help buffering and pub/sub.


## Scripts (from `package.json`) 🛠️
- `npm run dev` — start Vite dev server (hot reload)
- `npm run build` — build production-ready assets into `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint over the project


## Environment Variables 🔑
Create a `.env` file in the `frontend/` folder (Vite reads `.env` variables prefixed with `VITE_`).
At minimum:
```
VITE_API_URL=http://localhost:8080
VITE_FRONTEND_URL=http://localhost:5173
```
- `VITE_API_URL` should point to your backend API+socket server. SocketContext uses this to connect to the backend.


## How sockets are wired (short) ⚡
- `SocketContext.jsx` instantiates `io(VITE_API_URL)` and exposes a `socket` instance via React Context.
- Pages call `useSocket()` to access the socket and register `socket.on(...)` listeners.
- Important events used by the client: `driveCreated`, `driveUpdated`, `driveCancelled`, chat/room messages.
- Clean-up: components remove listeners on unmount to avoid memory leaks.


## Styling & UI
- Tailwind CSS is used for most utility layout classes.
- Material-UI components (MUI) are used for modals, cards, avatars and other polished controls.
- You will see both `className` Tailwind utilities and MUI components used together — this is intentional to get quick layout with consistent controls.


## Where to look next (map for reviewers) 🗺️
- Socket wiring & connection: `src/context/SocketContext.jsx`
- Initiative UI & list: `src/citizen/pages/CommunityInitiatives.jsx` and `src/citizen/components/InitiativeCard.jsx`
- New initiative form: `src/citizen/components/NewInitiativeModal.jsx`
- Chat UI: `src/citizen/components/ChatBox.jsx` and `src/citizen/pages/DiscussionForum.jsx`
- Authentication & route guards: `src/auth/ProtectedRoute.jsx`

## Live demo (deployed on Railway) 🚀
- Frontend (live): https://mernify25-frontend-production.up.railway.app


