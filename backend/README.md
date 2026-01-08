# Backend API Prototype - Detailed Documentation

This repository contains a Node.js and Express.js backend application designed as a prototype for a user and project management system. It demonstrates secure authentication, role-based access control (RBAC), and a modular API architecture using an in-memory data store.

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Architecture Diagram](#architecture-diagram)
3.  [Directory Structure](#directory-structure)
4.  [Key Data Flows](#key-data-flows)
5.  [API Features](#api-features)
6.  [Setup & Usage](#setup--usage)
7.  [Detailed Documentation](#detailed-documentation)

---

## Project Overview

The application simulates a real-world backend with the following core capabilities:
*   **Users & Auth**: JWT-based login, user invitations, profile management, and admin controls.
*   **Projects**: Creation and management of projects.
*   **Role-Based Access**: System-level roles (`ADMIN` vs `END_USER`) and project-level roles (`MANAGER` vs `DEVELOPER`).
*   **Project Features**: Management of **Appointments** and **Comments** within projects.
*   **Settings**: A simple module for managing application settings.
*   **Architecture**: Follows a standard Controller-Route pattern, with an in-memory database for rapid prototyping.

---

## Architecture Diagram

A component diagram has been generated to visualize the high-level architecture of the application. You can view this diagram using a PlantUML viewer or plugin.

*   **File Location:** `architecture.puml`

---

## Directory Structure

```text
/
├── .env                # Environment variables (secrets, config)
├── package.json        # Dependencies and scripts
├── architecture.puml   # PlantUML architecture diagram
├── src/
│   ├── server.js       # MAIN ENTRY POINT
│   ├── db/
│   │   └── inMemory.js # Mock database (Arrays of objects)
│   ├── middleware/
│   │   ├── auth.js          # JWT verification & System-level Roles
│   │   └── projectAccess.js # Project-level Roles (Member checks)
│   ├── controllers/    # Business logic functions
│   │   ├── auth.controller.js
│   │   └── invitations.controller.js
│   └── routes/         # API Endpoint definitions
│       ├── auth.routes.js
│       ├── projects.routes.js
│       ├── users.routes.js
│       ├── appointments.routes.js
│       ├── comments.routes.js
│       └── settings.routes.js
└── docs/
    ├── api/openapi.yaml
    └── code_breakdown/ # In-depth explanation of each source file
```

---

## Key Data Flows

### 1. The Login Flow
1.  **User** sends `POST /auth/login` with credentials.
2.  **Server** routes the request to `src/routes/auth.routes.js`.
3.  **Route** calls the `login` function in `src/controllers/auth.controller.js`.
4.  **Controller** reads the `users` array from `src/db/inMemory.js`.
5.  **Controller** verifies the password hash using `bcrypt`.
6.  **Controller** signs and returns a **JWT Token**.

### 2. Accessing a Protected Project Resource (e.g., Comments)
1.  **User** sends `GET /projects/p1/comments` with an `Authorization: Bearer <token>` header.
2.  **Server** routes to `src/routes/comments.routes.js`.
3.  **Middleware (`requireAuth`)** validates the JWT and attaches the user's ID to the request.
4.  **Route Logic** checks if the user is a member of Project `p1` by querying the `projectMembers` array in `inMemory.js`.
5.  If access is granted, the **Route** filters the `comments` array for project `p1` and returns the list.
6.  If access is denied, it returns a `403 Forbidden` error.

---

## API Features

The API is organized by resource. Key features include:

*   **/auth**: Login and invitation acceptance.
*   **/users**: User management, searching, and invitations (Admin-only).
*   **/profile**: Viewing and updating the current user's own profile.
*   **/projects**: Core project management.
*   **/projects/:id/appointments**: CRUD operations for project appointments.
*   **/projects/:id/comments**: CRUD operations for project comments.
*   **/settings**: Reading and updating application-wide settings.

---

## Setup & Usage

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [npm](https://www.npmjs.com/)

### Installation
```bash
npm install
```

### Running the Server
```bash
npm run dev
```
The server will start on the port defined in your `.env` file (default `3001`), with `nodemon` watching for file changes.

---

## Detailed Documentation

For a file-by-file breakdown of the source code, including its connections and OpenAPI mappings, see the documents inside the `docs/code_breakdown/` directory.
