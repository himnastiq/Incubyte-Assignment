# Incubyte

A production-ready full-stack TypeScript application for managing a car dealership inventory system. The repository contains a React + Vite frontend and an Express + TypeScript backend with authentication, role-based access control, vehicle management, search, purchase, and restock workflows.

## Overview

Incubyte is structured as a split frontend/backend application:

- **Client**: React application built with Vite and TypeScript
- **Server**: Express API built with TypeScript, MongoDB, and Mongoose
- **Tests**: Frontend component tests and backend integration/unit tests

The application is designed around the following core user flows:

- Register a new account
- Log in and access protected application areas
- Browse the vehicle dashboard
- Search and filter vehicles
- Admin users can create and edit vehicles
- Purchase vehicles from inventory
- Restock vehicle inventory as an admin

## Features

### Authentication and Authorization
- User registration and login
- JWT-based authentication
- Protected routes for authenticated users
- Admin-only routes and actions
- Password hashing with bcrypt

### Vehicle Management
- Vehicle listing and dashboard experience
- Admin vehicle create/edit pages
- Search and filter support for inventory discovery
- Inventory purchase and restock flows
- Server-side validation for API requests

### Security and Reliability
- CORS enabled
- Helmet security headers
- Rate limiting
- Environment-based configuration
- Validation with Zod
- Test coverage planned for critical flows

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- Testing Library
- Vitest

### Backend
- Node.js
- Express 5
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod
- Jest
- Supertest
- MongoDB Memory Server

## Repository Structure

```text
.
├── client/        # React frontend
├── server/        # Express backend
├── TEST_PLAN.md   # Planned test coverage
└── package.json   # Root workspace metadata
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- MongoDB instance

### Installation

Clone the repository and install dependencies for each project:

```bash
git clone https://github.com/himnastiq/incubyte.git
cd incubyte
npm install
cd client && npm install
cd ../server && npm install
```

### Environment Variables

Create a `.env` file in `server/` with the required values for your environment. A typical setup includes:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

If your client requires a custom API base URL, configure it according to your deployment or local setup.

## Available Scripts

### Root

The root package currently contains shared workspace metadata and development dependencies.

### Client

From `client/`:

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:watch
npm run preview
```

### Server

From `server/`:

```bash
npm run dev
npm run build
npm run test
npm run test:watch
npm run lint
npm run format
npm run seed:admin
```

## Application Routes

### Frontend Routes
- `/login` — user login page
- `/register` — user registration page
- `/dashboard` — protected inventory dashboard
- `/admin/vehicles/new` — admin vehicle creation form
- `/admin/vehicles/edit/:id` — admin vehicle edit form

### Backend Capabilities
The backend is expected to expose endpoints for:
- Health checks
- Authentication
- Vehicle CRUD operations
- Vehicle search and filtering
- Purchase and restock operations

See `TEST_PLAN.md` for the planned API coverage.

## Testing Strategy

The repository includes a detailed test plan covering:

- Backend health and authentication flows
- Vehicle CRUD, search, purchase, and restock behavior
- JWT and password helper unit tests
- Frontend authentication and dashboard component tests
- Protected/admin route behavior

Run tests in each package as needed:

```bash
cd client && npm run test
cd ../server && npm run test
```

## Deployment Notes

For production deployments:

- Build the frontend and backend before release
- Set all required environment variables in your hosting platform
- Provision a production MongoDB database
- Use a strong JWT secret
- Ensure CORS and API base URLs match the deployed environment
- Seed admin access only in controlled environments

## License

ISC
