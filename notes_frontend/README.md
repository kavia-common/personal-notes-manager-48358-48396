# Notes Frontend (Ocean Professional)

A lightweight React single-page notes app with a sidebar and main content area.

Features:
- Create, view, edit, delete personal notes
- Basic search/filter from sidebar
- Ocean Professional theme with blue and amber accents
- Responsive layout, rounded corners, subtle shadows, smooth transitions
- Storage via backend API (if configured) or localStorage fallback

Environment variables:
- REACT_APP_API_BASE: Base URL for notes API (e.g., https://api.example.com). If set (non-empty), the app uses the API.
- REACT_APP_BACKEND_URL: Optional fallback if REACT_APP_API_BASE is empty.
- Other REACT_APP_* vars are ignored by the app UI but may be used by hosting.

Storage behavior:
- API mode: When REACT_APP_API_BASE is defined, CRUD operations are sent to the backend.
- Local mode: When REACT_APP_API_BASE is empty, data is persisted in localStorage. The first run seeds a couple of example notes.

Styling:
- Main styles are in src/theme.css (colors, layout).
- index.css has base resets.

Development:
- npm start
- npm test
- npm run build

Notes API contract (expected if using API):
- GET    {API_BASE}/notes?query=...       -> [ {id,title,content,createdAt,updatedAt}, ... ]
- GET    {API_BASE}/notes/:id             -> {id,title,content,createdAt,updatedAt}
- POST   {API_BASE}/notes                 -> body: {title,content}
- PUT    {API_BASE}/notes/:id             -> body: {title,content}
- DELETE {API_BASE}/notes/:id             -> 200 OK on success

No hard-coded ports are used. The app relies on the environment's preview system.
