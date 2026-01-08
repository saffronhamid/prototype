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
    *   `src/routes/`
    *   `src/middleware/`

---

## 3. Code Breakdown & OpenAPI Connections

This file declares several `const` arrays (`users`, `projects`, `comments`, etc.) to hold the application's data.

### `users`
*   **Purpose**: Stores all user accounts.
*   **Structure**: Each object represents a user. The `role` property (`ADMIN` vs. `END_USER`) is critical for authorization.
*   **OpenAPI Connection**: This array holds the data that backs the `User` schema (`components/schemas/User`).

### `projects`
*   **Purpose**: Stores all project records.
*   **OpenAPI Connection**: This holds the data backing the `ProjectSummary` and `ProjectDetail` schemas.

### `projectMembers`
*   **Purpose**: A "linking table" that creates a many-to-many relationship between `users` and `projects`. This is crucial for checking project-specific permissions.

### `appointments`, `comments`, `invitations`
*   **Purpose**: These arrays store the data for their respective features.
*   **OpenAPI Connection**: The structure of the objects pushed into these arrays should match their corresponding schemas in the `openapi.yaml` file (e.g., `appointment`, `Comment`).

### `connectionMonitorSettings`
*   **Purpose**: A simple object to hold application settings, demonstrating how configuration could be stored.

### Module Export
```javascript
// This must be at the end of the file
module.exports = {
  users,
  projects,
  projectMembers,
  invitations,
  appointments,
  comments,
  connectionMonitorSettings,
};
```
*   **`module.exports`**: This line, placed at the very end of the file, exposes all the data arrays and settings objects. This ensures that all variables are declared *before* they are exported, preventing "Cannot access before initialization" errors. Any other file can now `require` this module to access the "database."
