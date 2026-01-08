# Code Breakdown: `src/routes/users.byId.routes.js`

This file defines a set of user management endpoints that operate on a specific user identified by their ID in the URL. These are **admin-only** actions.

---

## 1. File Purpose & High-Level View

The purpose of this file is to group all administrative actions that target a specific user (`/users/:user_id`). This includes:
*   Getting a user's details.
*   Updating a user's details (as an admin).
*   Deleting a user account.

This modular approach keeps the main `users.routes.js` file cleaner.

---

## 2. Connections to Other Files

*   **`src/server.js` (Parent)**: Imports this router and mounts it at the `/users` path.
*   **`../middleware/auth.js` (Security)**: Imports `requireAuth` and `requireRole` to lock down all endpoints in this file to admins only.
*   **`../db/inMemory.js` (Database)**: Imports `users` and `projectMembers` to read, update, and delete data.

---

## 3. Code Breakdown & OpenAPI Connections

### `safeUser(u)`
*   **Purpose**: A helper to strip the `passwordHash` before returning a user object in a response.

### Global Middleware
```javascript
router.use(requireAuth, requireRole("ADMIN"));
```
*   **Explanation**: This applies the `requireAuth` and `requireRole("ADMIN")` middleware to **every single route** defined in this file, ensuring only admins can access them.

### `GET /users/:user_id`
*   **Explanation**: Finds a user by their ID and returns their data.
*   **OpenAPI Connection**:
    *   **Path**: `paths./users/{user_id}.get`
    *   **Implementation**: Directly implements the endpoint, with security handled by the global `router.use()`.

### `PATCH /users/:user_id`
*   **Explanation**: An admin-only endpoint to partially update another user's `username`, `firstName`, `lastName`, and `role`.
*   **OpenAPI Connection**:
    *   **Path**: `paths./users/{user_id}.put`. (Note: YAML uses `PUT`, code uses `PATCH`).
    *   **Implementation**: Allows an admin to update user fields from the `req.body`, matching the intent of the `AdminUserUpdate` schema.

### `DELETE /users/:user_id`
*   **Explanation**: Deletes a user from the `users` array and also cleans up their memberships from the `projectMembers` array.
*   **OpenAPI Connection**:
    *   **Path**: `paths./users/{user_id}.delete`
    *   **Implementation**: This route directly implements the delete functionality, including the `204` success response and security checks.

---

### Module Export
```javascript
module.exports = router;
```
*   Exports the router for use in `server.js`.
