# BuhatonKo

**A student-to-student freelance marketplace.** Students offer their skills (design, tutoring, editing, computer help, photography) and fellow students hire them for affordable help.

## Features (MVP)

- Sign up, log in, log out (passwords hashed with bcrypt, session cookies)
- Student profiles with school, skills, bio, rating and completed-job count
- Service listings: create, edit, pause/activate (fixed or starting price, delivery time, online/in-person)
- Browse and search by keyword, category, max price and delivery mode
- Job requests with a status flow: Requested → Accepted / Declined → In progress → Submitted for review → Completed (or Cancelled), with a full status history
- Messages inside each job
- Reviews, allowed only after a completed job (one per job)
- Dashboard for incoming requests, my requests and my services

## Tech stack

- **Backend:** Node.js, Express 5, express-session, bcryptjs
- **Database:** TiDB Cloud (MySQL-compatible), mysql2
- **Frontend:** HTML, CSS, vanilla JavaScript

## Project structure

```
index.js            server setup
db.js               database connection pool
middleware/         requireLogin
routes/             auth, profile, services, jobs (the API)
public/             frontend pages, CSS and JS
schema.sql          creates all tables
seed.sql            demo data
```

## Run locally

1. `npm install`
2. Create a `.env` file:
   ```
   DB_HOST=your-tidb-host
   DB_PORT=4000
   DB_USER=your-tidb-user
   DB_PASSWORD=your-tidb-password
   DB_NAME=buhatonko
   SESSION_SECRET=a-long-random-string
   ```
3. Run `schema.sql`, then `seed.sql`, in the TiDB Cloud SQL Editor
4. `npm run dev`, then open http://localhost:3000

## Demo accounts

All demo accounts use the password **`demo12345`**.

| Email | Role in the demo |
|---|---|
| `demo@uc.edu.ph` | Customer with completed, in-progress and pending jobs |
| `miguel@uc.edu.ph` | Provider (graphic design, video editing) |
| `ana@uc.edu.ph` | Provider (tutoring) |
| `jasmine@uc.edu.ph` | Provider (proofreading, captions) |

## Team

Christ Hanzen Rallos (CEO) · Ricardo Y. Baje Jr. (CTO) · Richard Casinillo (CBDO) · Vaugn Xhander Garcia (CMO) · Shantal Cabutaje
