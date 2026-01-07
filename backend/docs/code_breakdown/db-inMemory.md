# Code Breakdown: `src/db/inMemory.js`

This file serves as the **mock database** for the entire application. In a production environment, this would be replaced by a connection to a real database system like PostgreSQL, MongoDB, or MySQL.

---

## 1. File Purpose & High-Level View

The purpose of this file is to provide a simple, stateful, in-memory data store. It exports several arrays that act as database "tables." Because it's just a standard JavaScript module, the data persists as long as the server is running. If the server restarts, all data reverts to its initial state defined in this file.

This approach is extremely useful for prototyping and testing because it has zero external dependencies and is very fast.

---

## 2. Connections to Other Files

This file is a **fundamental dependency** for almost all business logic.

*   **Consumers**: Any file that needs to read or write data will import objects from here. This includes nearly all files in:
    *   `src/controllers/`
    *   `src/routes/` (for routes with inline logic)
    *   `src/middleware/` (e.g., `projectAccess.js` needs to check the `projectMembers` table)

---

## 3. Code Breakdown & OpenAPI Connections

### Imports
```javascript
const bcrypt = require("bcrypt");
```
*   **`bcrypt`**: This library is used to hash the default user passwords. It's important that we store hashed passwords (`passwordHash`) even in a mock database, as it's a critical security practice.

### Data Tables (Arrays)

#### `users`
```javascript
const users = [
  {
    id: "u1",
    username: "admin",
    //...
    passwordHash: bcrypt.hashSync("Test1234!", 10),
  },
  //...
];
```
*   **Purpose**: Stores all user accounts.
*   **Structure**: Each object represents a user. The `role` property (`ADMIN` vs. `END_USER`) is critical for authorization logic throughout the app.
*   **OpenAPI Connection**: This array holds the data that backs the `User` schema (`components/schemas/User`). The properties in these objects (`id`, `username`, `email`, `role`, etc.) should correspond to the properties defined in the `User` schema.

#### `projects`
```javascript
const projects = [
  {
    id: "p1",
    name: "Smart-Rent",
    //...
  },
];
```
*   **Purpose**: Stores all project records.
*   **OpenAPI Connection**: This holds the data backing the `ProjectSummary` and `ProjectDetail` schemas.

#### `projectMembers`
```javascript
const projectMembers = [
  { projectId: "p1", userId: "u2", projectRole: "DEVELOPER" },
];
```
*   **Purpose**: This is a "join table" or "linking table." It creates a many-to-many relationship between `users` and `projects`.
*   **Explanation**: This structure allows a user to be a member of multiple projects and a project to have multiple users, each with a specific role within that project (e.g., a user can be a `DEVELOPER` on one project and a `MANAGER` on another).
*   **Connection**: This array is crucial for security middleware like `projectAccess.js` and for endpoints like `GET /projects/mine` that need to determine a user's project memberships.

#### `invitations`
```javascript
const invitations = [];
```
*   **Purpose**: Stores invitation records created by admins.
*   **Connection**: Used by `invitations.controller.js` to create invites and by `acceptInvitation.controller.js` to validate and consume them.
*   **OpenAPI Connection**: The objects pushed into this array should match the schema described in the `POST /users/invite` and `POST /auth/accept-invitation` endpoints.

### Module Export
```javascript
module.exports = { users, projects, projectMembers, invitations };
```
*   **`module.exports`**: This line exposes all the data arrays, making them available to any other file in the application that `require`s them. This is how other files access the "database."
