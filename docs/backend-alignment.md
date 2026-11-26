# Backend alignment notes

The running 7.77 API (FastAPI) is the source of truth for this frontend. The
SRS in `spec/` describes the product intent; where the implemented contract
differs, the frontend follows the API (the deviations are intentional) and
this file records how each one is handled.

| Area | SRS blueprint | Implemented API | Frontend handling |
| --- | --- | --- | --- |
| Instructor | `instructor_name` free text | Manager CRUD at `GET/POST /instructors`, `GET/PUT/DELETE /instructors/{id}`, `POST /instructors/{id}/photo`; public list at `GET /public/instructors` | Managers manage instructor profiles and photos from `/manager/instructors`. Session forms load the manager roster and submit `instructor_id`; editing preselects it from the management detail. The homepage uses the unauthenticated public endpoint and only renders name, bio and photo. `email` and `phone` are manager-only. |
| Session update | `PATCH /sessions/{id}` | `PUT /sessions/{id}` | `api/sessions.js#updateSession` sends the full `SessionUpdateRequest`. |
| Profile | `/users/me` | `/auth/me` | `api/auth.js` uses `/auth/me`. |
| My sessions | `/users/me/sessions` | `/sessions/my` | `getMySessions` maps `registration_state`, `registration_id` and `registered_at`. |
| Manager list | participant `GET /sessions` | `GET /sessions/management` | The manager workspace uses the management endpoint (it is the only one returning target categories and instructor ids). |
| Session stats | `GET /sessions/{id}/stats` | counts nested in `GET /sessions/{id}/management` | The attendance screen shows registered / attended / validated / absent from that detail. |
| Errors | `{ error: { code, message } }` | FastAPI `{ detail: … }` | `api/errors.js` understands both and produces `ApiError` with `status`/`code`; the SRS envelope is supported if the backend adopts it. |
| Certificates | Client-rendered from validated data | JSON data endpoint + server PDF | The profile downloads the server PDF (`GET /certificates/{registration_id}/pdf`) and lists certificates from `GET /certificates/`. |
| Status | Computed on read | `status` field is a snapshot at fetch time | The UI derives OPEN/RUNNING/COMPLETED from `date` + `start_time` + `duration` with `useNow`, so badges advance while a page is open; the server value is a fallback and `CANCELLED` is always the stored override. |
| Attendance | First successful `/join` | Same | The join button is available from T‑60min to session end; the backend records attendance. Managers validate attended registrations in bulk, which issues certificates. |
| Registration states | 5 derived states | `registration_state` string (enum not documented) | Mapped tolerantly (`registered`, `attended`, `absent`, `cancelled`, …); unknown values are shown readably. |
| Activation / migration | `POST /auth/activate` | Not exposed | No activation screen until the backend provides the endpoint. |

## Environment and CORS

- `VITE_API_BASE_URL` is required (`src/api/config.js` throws without it);
  copy `.env.example` to `.env.local`.
- The API's CORS allowlist only accepts `http://localhost:5173`, so
  `vite.config.js` pins the dev and preview servers to that port with
  `strictPort: true`. Using another port produces a browser CORS error, not an
  application error.

## Verified against the live API

- `GET /health` → `{"status":"ok"}`
- Unauthenticated `GET /sessions` → `401 {"detail":"Could not validate credentials"}` (participant routes are auth-gated).
- `OPTIONS` preflight from `http://localhost:5173` → allowed for GET/POST/PUT/PATCH/DELETE with `Authorization`.
- `POST /auth/login` with bad credentials → `401 {"detail":"Invalid email or password"}`.
- `POST /auth/register` validation errors use the FastAPI `detail` array.

The integration was verified at the contract level (OpenAPI, CORS, error
shapes) and with unit tests for the mappers/status logic. End-to-end login
requires a real account on the backend.

## Generated card artwork

Participant session responses do not expose a training id, so card artwork is
keyed on `training_type_description` (falling back to the session title).
`src/utils/trainingImage.js` derives a deterministic palette, glyph and
monogram from that key, so every session of the same training type shows the
same image, no external photos are fetched, and the artwork works offline.

## Home page content

The home page is split into three full-viewport, free-scrolling parts
(hero → platform introduction + instructor showcase → closing CTA +
footer).
The instructor showcase loads `GET /public/instructors` on page load and
renders only the featured instructors with photos returned by the API. It
shows name, bio (when present) and the resolved `photo_url`; the public shape
contains no email or phone. Loading, empty and error states are handled
without leaving a broken carousel.
