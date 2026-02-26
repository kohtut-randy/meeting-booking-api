# Meeting Room Booking System (Backend)

A Node.js backend API for managing a single meeting room with role-based access control and PostgreSQL persistence.

## Features

- User authentication and authorization
- Role-based access for admin and regular users
- Create, view, and manage bookings
- Booking conflict handling
- PostgreSQL integration using a clean service/controller structure

## Tech Stack

- Node.js
- Express.js
- PostgreSQL

## Project Structure

```text
src/
	app.js
	config/
		database.js
	controllers/
		authController.js
		bookingController.js
		userController.js
	middleware/
		auth.js
		validation.js
	models/
		Booking.js
		User.js
	routes/
		authRoutes.js
		bookingRoutes.js
		userRoutes.js
	services/
		bookingService.js
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

3. Create database tables (via pgAdmin or `psql`) using your schema SQL.

4. Start the server:

```bash
npm start
```

## API Overview

- Authentication endpoints: `src/routes/authRoutes.js`
- Booking endpoints: `src/routes/bookingRoutes.js`
- User endpoints: `src/routes/userRoutes.js`

Use these route files as the source of truth for available endpoints and request payloads.

## Final Conclusion

This backend provides a solid foundation for a meeting room booking platform with clear modular architecture, secure access control, and reliable PostgreSQL data handling. It is ready for integration with a frontend client and can be extended with features like notifications, audit logs, and multi-room support as your requirements grow.
