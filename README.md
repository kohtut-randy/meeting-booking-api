# Meeting Room Booking System with PostgreSQL

A Node.js-based booking system for a single meeting room with role-based access control using PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- pgAdmin (optional, for database management)

## Database Setup

1. **Create the database tables** using pgAdmin or psql:

Run the SQL script from `database-setup.sql` (provided above) in pgAdmin query tool.

2. **Configure environment variables**:

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:hein1820@localhost:5432/postgres
PORT=3000
CORS_ORIGIN=http://localhost:5173
```
