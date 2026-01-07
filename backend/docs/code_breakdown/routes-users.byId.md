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
*   **Explanation**: This is a powerful feature of Express. `router.use()` applies these middleware functions to **every single route** defined in this file. This is a concise way to protect an entire module of routes without repeating the middleware on each one.

### `GET /users/:user_id`
*   **Code**: `router.get("/:user_id", ...)`
*   **Explanation**: Finds a user by their ID from `req.params.user_id` and returns their data (after cleaning with `safeUser`).
*   **OpenAPI Connection**:
    *   **Path**: `paths./users/{user_id}.get`
    *   **Summary**: `Display details of user account (Just Admins)`
    *   **Implementation**: This route directly implements the endpoint, with security handled by the global `router.use()`.

### `PATCH /users/:user_id`
*   **Code**: `router.patch("/:user_id", ...)`
*   **Explanation**: An admin-only version of "update profile." It allows an admin to change another user's `username`, `firstName`, `lastName`, and `role`. It includes validation for each field.
*   **OpenAPI Connection**:
    *   **Path**: `paths./users/{user_id}.put`. The YAML uses `PUT`, while the code uses `PATCH`. `PATCH` is more appropriate as it's a partial update.
    *   **Summary**: `Update another user's account (Just Admins)`
    *   **Implementation**: The code allows an admin to update user fields from the `req.body`, matching the intent of the `AdminUserUpdate` schema in the YAML.

### `DELETE /users/:user_id`
*   **Code**: `router.delete("/:user_id", ...)`
*   **Explanation**:
    1.  Finds the user's index in the `users` array.
    2.  Prevents an admin from deleting their own account.
    3.  As a cleanup step, it iterates through `projectMembers` and removes any memberships associated with the deleted user.
    4.  `users.splice(idx, 1)` removes the user from the database array.
    5.  Returns a `204 No Content` success response.
*   **OpenAPI Connection**:
    *   **Path**: `paths./users/{user_id}.delete`
    *   **Summary**: `Delete a user account (Just Admins)`
    *   **Implementation**: This route directly implements the delete functionality, including the `204` success response and security checks.

### Module Export
```javascript
module.exports = router;
```
*   Exports the router for use in `server.js`.
