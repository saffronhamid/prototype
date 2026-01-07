# Backend API Prototype - Detailed Documentation

This repository contains a Node.js and Express.js backend application designed as a prototype for a user and project management system. It demonstrates secure authentication, role-based access control (RBAC), and modular API architecture without requiring an external database (using in-memory data structures).

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Directory Structure](#directory-structure)
3.  [Detailed File Analysis](#detailed-file-analysis)
    *   [Configuration & Entry Point](#configuration--entry-point)
    *   [Database Layer](#database-layer-srcdb)
    *   [Middleware Layer](#middleware-layer-srcmiddleware)
    *   [Controllers Layer](#controllers-layer-srccontrollers)
    *   [Routes Layer](#routes-layer-srcroutes)
4.  [Key Data Flows](#key-data-flows)
5.  [Setup & usage](#setup--usage)

---

## Project Overview

The application simulates a real-world backend with the following core capabilities:
*   **Users & Auth**: Users can login, view profiles, and update details.
*   **Projects**: Users belong to projects with specific roles (e.g., `MANAGER`, `DEVELOPER`).
*   **Security**: Uses JWT (JSON Web Tokens) for stateless authentication.
*   **Architecture**: Follows a standard Model-Controller-Route pattern, though optimized for a prototype (in-memory data).

---

## Directory Structure

```text
C:\Users\SILICON VALLEY\Desktop\prototype\backend\
├── .env                # Environment variables (secrets, config)
├── package.json        # Dependencies and scripts
├── src/
│   ├── server.js       # MAIN ENTRY POINT
│   ├── db/
│   │   └── inMemory.js # Mock database (Arrays of objects)
│   ├── middleware/
│   │   ├── auth.js          # JWT verification & System-level Roles
│   │   └── projectAccess.js # Project-level Roles (Member checks)
│   ├── controllers/    # Business logic functions
│   │   ├── auth.controller.js
│   │   ├── invitations.controller.js
│   │   └── ...
│   └── routes/         # API Endpoint definitions
│       ├── auth.routes.js
│       ├── projects.routes.js
│       ├── users.routes.js
│       └── ...
└── docs/               # OpenAPI/Swagger documentation
```

---

## Detailed File Analysis

### Configuration & Entry Point

#### `src/server.js`
**Purpose**: The central hub of the application.
**Functionality**:
1.  **Initialization**: Loads environment variables (`dotenv`) and sets up the Express app.
2.  **Middleware Setup**: Configures global middleware like `cors` (Cross-Origin Resource Sharing) and body parsing (`express.json`).
3.  **Route Mounting**: Connects all the route files to specific URL paths.
    *   *Example*: `app.use("/auth", authRoutes)` means any request starting with `/auth` goes to `auth.routes.js`.
4.  **Server Start**: Listens on the configured `PORT`.

#### `.env`
**Purpose**: Stores sensitive configuration.
**Key Variables**:
*   `PORT`: Port number for the server (default `3001`).
*   `JWT_SECRET`: The private key used to sign and verify authentication tokens.

---


### Database Layer (`src/db`)

#### `src/db/inMemory.js`
**Purpose**: Acts as the data source in place of a real database (like SQL or MongoDB).
**Contents**:
*   `users`: Array of user objects (contains hashed passwords, roles).
*   `projects`: Array of project metadata.
*   `projectMembers`: Relational table (Many-to-Many) linking `users` to `projects` with a `projectRole`.
*   `invitations`: Stores pending user invites.
**Connection**: Imported by Controllers and Routes to read/write data.

---


### Middleware Layer (`src/middleware`)

#### `src/middleware/auth.js`
**Purpose**: Handles System-Level Security.
**Exports**:
1.  `requireAuth`: Checks for the `Authorization: Bearer <token>` header. Verifies the token using `jsonwebtoken`. Adds the decoded user to `req.user`.
2.  `requireRole(...roles)`: Checks if `req.user.role` matches one of the allowed roles (e.g., `ADMIN`).
**Usage**: Applied to protected routes in `src/routes/`.

#### `src/middleware/projectAccess.js`
**Purpose**: Handles Project-Level Security.
**Exports**:
1.  `requireProjectRole`: Checks if the authenticated user is actually a member of the specific project they are trying to access.
**Usage**: Used in `projects.routes.js` for routes like `GET /projects/:id`.

---


### Controllers Layer (`src/controllers`)

Controllers hold the "Business Logic" — the actual code that executes when a user hits an endpoint. They keep the Route files clean.

#### `src/controllers/auth.controller.js`
**Purpose**: Manages authentication logic.
**Key Functions**:
*   `login(req, res)`:
    1.  Receives `identifier` (username/email) and `password`.
    2.  Finds user in `inMemory.js`.
    3.  Compares password hash using `bcrypt`.
    4.  Generates a JWT token.
    5.  Returns the token and safe user details (no password).

#### `src/controllers/invitations.controller.js` & `acceptInvitation.controller.js`
**Purpose**: Logic for inviting new users and processing their acceptance tokens.

---


### Routes Layer (`src/routes`)

Route files define the API endpoints (URLs) and map them to specific Controller functions or write the logic inline.

#### `src/routes/auth.routes.js`
*   **Path**: `/auth`
*   **Endpoints**: `POST /login` (calls `auth.controller.js`).

#### `src/routes/projects.routes.js`
*   **Path**: `/projects`
*   **Endpoints**:
    *   `GET /`: List projects (Admin only).
    *   `GET /mine`: List projects the current user belongs to.
    *   `GET /:id`: Get project details (Checks `projectMembers` data).
    *   `POST /`: Create project.
*   **Connection**: Heavily uses `requireAuth` and `inMemory.js`.

#### `src/routes/users.*.routes.js` (Modular User Routes)
The user routes are split into multiple files for better organization:
*   `users.routes.js`: General user management (List users).
*   `users.me.routes.js`: Operations on the *currently logged-in* user (e.g., "Get my profile").
*   `users.byId.routes.js`: Operations requiring a User ID (e.g., "Get User #1").
*   `profile.routes.js` & `updateProfile.routes.js`: Specific profile handling.

---


## Key Data Flows

### 1. The Login Flow
1.  **User** sends `POST /auth/login` with credentials.
2.  **Server** routes request to `src/routes/auth.routes.js`.
3.  **Route** calls `login` function in `src/controllers/auth.controller.js`.
4.  **Controller** reads `users` from `src/db/inMemory.js`.
5.  **Controller** verifies password with `bcrypt`.
6.  **Controller** returns a **JWT Token**.

### 2. Accessing a Protected Project
1.  **User** sends `GET /projects/p1` with `Authorization: Bearer <token>`.
2.  **Server** routes to `src/routes/projects.routes.js`.
3.  **Middleware (`requireAuth`)** validates token and attaches user ID to request.
4.  **Route Logic** checks `src/db/inMemory.js` (`projectMembers` array):
    *   *Is User ID in Project ID "p1"?*
5.  If yes, **Route** returns the project JSON.
6.  If no, returns `403 Forbidden`.

---


## Setup & Usage

### Prerequisites
*   Node.js installed.

### Installation
```bash
npm install
```

### Running
```bash
npm run dev
```

### Testing the API
You can use tools like **Postman** or **cURL**.
*   **Default Admin User**: `admin` / `Test1234!`
*   **Default Dev User**: `dev` / `Test1234!`