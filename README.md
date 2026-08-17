# NoteTaker

A full-stack note-taking app (MongoDB, Express, Node.js, EJS) with session-based auth and owner-scoped notes. Users sign up, log in, and manage a private collection of notes — create, view, edit, delete, and search — with each note strictly scoped to its author.

---


## Tech Stack

- **Backend:** Node.js, Express 5
- **Database:** MongoDB Atlas + Mongoose
- **Views:** EJS + `ejs-mate` (shared layouts)
- **Auth:** Passport.js (`passport-local`, `passport-local-mongoose`)
- **Sessions:** `connect-mongo` (stored in MongoDB, not memory)
- **Validation:** Joi
- **Flash messages:** `connect-flash`
- **Styling:** Bootstrap

---

## Architecture (MVC)

```
Request → Router → Middleware (auth/validation) → Controller → Model → DB
                                                        ↓
                                                  View (EJS) → Response
```

- **Models** (`models/`) — data shape & persistence only.
- **Controllers** (`controllers/`) — business logic per resource.
- **Routes** (`routes/`) — maps HTTP verb + path → middleware chain → controller. No logic here.
- **Middleware** (`middleware.js`) — auth checks, authorization checks, validation — kept out of controllers.
- **Views** (`views/`) — server-rendered EJS, composed via `ejs-mate`.

---

## Features

- User signup/login/logout via Passport local strategy (passwords hashed & salted automatically)
- Persistent sessions in MongoDB — survive server restarts/redeploys
- Full CRUD on notes
- Owner-scoped access — users only see/manage their own notes; enforced via `isAuthor` middleware
- Case-insensitive title search
- Flash messages for success/error feedback
- Redirect-after-login to originally requested page
- Joi validation on all note submissions before DB writes
- Centralized error handling via custom `ExpressError` + catch-all middleware
- Env-based config — secrets never hardcoded

---

## Folder Structure

```
NoteTaker/
├── app.js                # Entrypoint: DB connection, session/passport, route mounting
├── middleware.js          # isLoggedIn, isAuthor, saveRedirectUrl, validateNotes
├── Schema.js               # Joi schema for note payloads
├── controllers/             # notes.js, user.js — business logic
├── models/                   # notes.js, user.js — Mongoose schemas
├── routes/                    # notes.js, user.js — route definitions
├── utils/                      # ExpressError.js, wrapAsync.js
├── views/                       # EJS templates
├── public/                       # Static assets
└── .env                            # Local secrets (not committed)
```

---

## Data Models

**User** — `username`, `hash`/`salt` (auto-managed by `passport-local-mongoose`), `email`

**Note** — `title` (required, ≤100 chars), `description` (required, ≤200 chars), `content` (required, ≤7000 chars), `created_at` (defaults to now), `author` (ref → User, set server-side only)

---

## Routes

### `/notes` (auth required)

| Method | Path              | Middleware                                | Purpose               |
| ------ | ----------------- | ----------------------------------------- | --------------------- |
| GET    | `/notes`          | `isLoggedIn`                              | List user's notes     |
| GET    | `/notes/new`      | `isLoggedIn`                              | New note form         |
| POST   | `/notes`          | `isLoggedIn`, `validateNotes`             | Create note           |
| GET    | `/notes/search`   | `isLoggedIn`                              | Search notes by title |
| GET    | `/notes/:id`      | `isLoggedIn`                              | View note             |
| GET    | `/notes/:id/edit` | `isLoggedIn`, `isAuthor`                  | Edit form             |
| PUT    | `/notes/:id`      | `isLoggedIn`, `isAuthor`, `validateNotes` | Update note           |
| DELETE | `/notes/:id`      | `isLoggedIn`, `isAuthor`                  | Delete note           |

### Users & Misc

| Method   | Path         | Purpose                                 |
| -------- | ------------ | --------------------------------------- |
| GET/POST | `/signup`    | Register + auto-login                   |
| GET/POST | `/login`     | Authenticate, redirect to intended page |
| GET      | `/logout`    | End session                             |
| GET      | `/`, `/home` | Landing page                            |
| ALL      | `/*splat`    | 404 catch-all                           |

---

## Environment Variables

```env
ATLAS_DB_URL=mongodb://<user>:<pass>@<host>:<port>/<unique-db-name>?ssl=true&replicaSet=<name>&authSource=admin&appName=<name>
SECRET=<long random string>
NODE_ENV=development
```

`ATLAS_DB_URL` should include a **unique database name** so this project doesn't collide with other apps sharing the same cluster.

---

## Local Setup

```bash
git clone <repo-url>
cd NoteTaker
npm install
# create .env as above
nodemon app.js
# → http://localhost:8080
```

---

## Notable Design Choices

- Non-SRV MongoDB connection string (some ISPs block SRV DNS lookups)
- Sessions stored in MongoDB, not memory — required for stateless redeploys
- Joi validation runs before any DB write

---
