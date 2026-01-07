# Code Breakdown: `src/routes/users.routes.js`

This file defines the primary, top-level API endpoints for the `/users` resource. It handles actions that apply to the user collection as a whole, such as listing/searching users and initiating an invitation.

---

## 1. File Purpose & High-Level View

The purpose of this file is to:
1.  Provide an admin-only endpoint to list and search all users.
2.  Provide an admin-only endpoint to trigger the user invitation process.
3.  Provide a `GET /users/me` endpoint as an alias for the current user's profile.

It acts as the main router for the `/users` path and delegates more specific actions (like `/users/invite`) to imported controllers.

---

## 2. Connections to Other Files

*   **`src/server.js` (Parent)**: Imports this router and mounts it at the `/users` path.
*   **`../middleware/auth.js` (Security)**: Imports `requireAuth` and `requireRole` to protect the admin-only endpoints.
*   **`../db/inMemory.js` (Database)**: Imports the `users` array to search and list users.
*   **`../controllers/invitations.controller.js` (Logic)**: Imports the `inviteUser` function to handle the invitation logic.

---

## 3. Code Breakdown & OpenAPI Connections

### `safeUser(u)`
*   **Purpose**: Helper to strip the `passwordHash` from user objects before returning them.

### `POST /users/invite`
*   **Code:** `router.post("/invite", requireAuth, requireRole("ADMIN"), inviteUser);`
*   **Explanation**: This route maps a `POST` request to `/users/invite` to the `inviteUser` controller. It is protected by middleware to ensure only an authenticated `ADMIN` can access it.
*   **OpenAPI Connection**:
    *   **Path**: `paths./users/invite.post`
    *   **Implementation**: This directly implements the endpoint, connecting the URL and security rules to the controller logic.

### `GET /users/me`
*   **Code**: `router.get("/me", requireAuth, (req, res) => { ... });`
*   **Explanation**: An alias for getting the current user's profile, identical in function to `GET /profile`.
*   **OpenAPI Connection**:
    *   **Path**: While the YAML has `PUT /users/me`, this `GET` endpoint's functionality matches `GET /profile`.

### `GET /users`
*   **Code**: `router.get("/", requireAuth, requireRole("ADMIN"), (req, res) => { ... });`
*   **Explanation**:
    1.  This is the handler for the root `/users` path. It's for listing all users.
    2.  It is protected to be `ADMIN` only.
    3.  It supports an optional `search` query parameter (e.g., `/users?search=john`).
    4.  If a search term is provided, it filters the list of users to find matches in `username` or `email`.
    5.  It maps over the results with `safeUser` to ensure no password hashes are sent.
*   **OpenAPI Connection**:
    *   **Path**: `paths./users.get`
    *   **Summary**: `Get all users (optionally filtered)`
    *   **Implementation**: This route directly implements the endpoint. The `search` query parameter is handled, the `ADMIN` only restriction is enforced, and the response is an array of `User` objects, matching the spec.

### Module Export
```javascript
module.exports = router;
```
*   Exports the router to be mounted by `server.js`.
