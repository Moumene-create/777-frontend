# 7.77 Training Platform — Frontend

React + Vite single-page application for Algérie Télécom's 7.77 online training
platform. It lets participants discover the sessions available for their age
category, register or unregister, join the Zoom session during the access
window, and download certificates once a session manager validated their
attendance. Session managers get a workspace to create, edit and cancel
sessions, and to validate attendance.

The application talks to the 7.77 Training Platform API (`FastAPI`). The
implemented API contract is authoritative; the product specification lives in
`spec/`.

## Requirements

- Node.js 20+
- The backend API running (default dev address: `http://10.42.0.1:8000`)

## Setup

Create a `.env.local` file at the project root:

```bash
VITE_API_BASE_URL=http://10.42.0.1:8000
```

`VITE_API_BASE_URL` is required — the app refuses to start without it.

```bash
npm install
npm run dev       # Vite dev server
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint      # ESLint
npm test          # node:test unit tests (pure mapping/status/payload code)
```

## Architecture

```
src/
  api/          HTTP clients: auth, sessions, training types, certificates,
                shared fetch/refresh wrapper, API error helpers
  components/   Shared UI (header, cards, session form, password form …)
  hooks/        useNow (ticking clock for session states)
  pages/        Route screens (participant + manager)
  utils/        Pure model mappers, status helpers, payload builder, formatting
  data/         (removed — all data comes from the backend)
```

Key points:

- `App.jsx` owns the auth session and the three server-backed collections:
  the participant session list (`/sessions`), the participant's registrations
  (`/sessions/my`) and the manager list (`/sessions/management`).
- Access tokens are kept in `sessionStorage`; a 401 triggers a single shared
  refresh/retry through `api/authenticatedFetch.js`.
- The backend enforces age-category eligibility, capacity, the one-hour
  registration cutoff, the Zoom access window and attendance recording, so the
  UI only mirrors those rules and surfaces the server errors.
- The manager form loads `GET /instructors` and sends the selected
  `instructor_id` with the API's actual payload: `training_id` (or
  `new_training_type`), `target_age_category_ids`, `zoom_url`,
  `prerequisites` and `start_time` in `HH:MM:SS`. Instructors are never
  free-text; the legacy `instructor_name`, `instructor_email` and
  `instructor_phone` fields are not sent.
- The manager instructor directory (`/manager/instructors`) covers create,
  edit, feature/unfeature, delete and photo replacement. The public homepage
  loads `GET /public/instructors`; email and phone are manager-only and are
  never part of the public instructor shape.

## Roles

- `PARTICIPANT`: browse eligible sessions, register/unregister, join, profile,
  certificates.
- `SESSION_MANAGER`: the manager workspace (`/manager`) and the profile only.
  Participant pages (sessions, my sessions) are hidden from the manager
  navigation and redirect to `/manager` if opened directly.

## Backend contract notes

The implemented API is authoritative where it differs from the SRS. The
intentional deviations (instructor UUID, `PUT` update, `/sessions/management`,
`/auth/me`, FastAPI error details, server PDF certificates) and the exact
frontend handling are documented in
[docs/backend-alignment.md](docs/backend-alignment.md).

## Theme

The app supports light and dark themes. The floating sun/moon button switches
the theme on every page, stores the choice in `localStorage` (`theme`) and
applies it through `data-theme` on `<html>`. Without a stored choice the app
follows the operating system preference.

All global design tokens — Geist typography scale, colours, borders,
radii, spacing and shadows — live in `src/index.css`. Component styles
reference those tokens; dark-theme component overrides live in
`src/styles/dark-theme.css`.
