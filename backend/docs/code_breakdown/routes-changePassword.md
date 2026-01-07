# Code Breakdown: `src/routes/changePassword.routes.js`

This file defines the specific API endpoint for an authenticated user to **change their own password**.

---

## 1. File Purpose & High-Level View

The purpose of this file is to create a dedicated route for the password change functionality. It handles the `POST` request, applies security middleware, and contains the logic to verify the user's current password and update it with a new one.

It is mounted at `/profile/change-password` in `server.js`, indicating it's an action related to the user's own profile.

---

## 2. Connections to Other Files

*   **`src/server.js` (Parent)**: Imports this router and mounts it at the `/profile/change-password` path.
*   **`../middleware/auth.js` (Security)**: Imports `requireAuth` to ensure that only a logged-in user can attempt to change their password.
*   **`../db/inMemory.js` (Database)**: Imports the `users` array to find the current user and update their `passwordHash`.
*   **`bcrypt` (Library)**: Used to compare the user's provided `currentPassword` and to hash the `newPassword`.

---

## 3. Code Breakdown & OpenAPI Connections

### Route Definition: `POST /`
The full path is `/profile/change-password` as defined in `server.js`.

*   **Code:**
    ```javascript
    router.post("/", requireAuth, async (req, res) => {
      // ... logic
    });
    ```
*   **Explanation:**
    1.  **`router.post("/")`**: Defines a `POST` request handler for the root of this router (`/`).
    2.  **`requireAuth`**: This middleware runs first, ensuring the user is logged in. If not, the request is rejected. The user's ID is attached to `req.user.id`.
    3.  **Input Validation**: It checks that `currentPassword` and `newPassword` were provided in the request body.
    4.  **Find User**: It uses `req.user.id` to find the correct user record in the `users` array.
    5.  **Verify Current Password**: `await bcrypt.compare(currentPassword, me.passwordHash)` securely checks if the `currentPassword` provided by the user is correct. If not, it returns a `400 Bad Request`.
    6.  **Hash New Password**: `await bcrypt.hash(newPassword, 10)` creates a new secure hash for the new password.
    7.  **Update Database**: It overwrites the old `passwordHash` on the user object with the new one.
    8.  **Return Success Response**: `res.status(204).send()` sends a `204 No Content` response. This is the correct HTTP standard for a successful action that doesn't need to return any data in the response body.

*   **OpenAPI Connection:**
    *   **Path:** `paths./profile/change-password.post`
    *   **Summary:** `Change user password`
    *   **Implementation:**
        *   The route directly implements this endpoint.
        *   The `requestBody` requiring `currentPassword` and `newPassword` is implemented in the validation logic (though the YAML specifies `confirm_new_password`, which is not implemented here—a slight divergence).
        *   The security requirement (user must be authenticated) is handled by `requireAuth`.
        *   The `400` error for incorrect current password and the `204` success response are both implemented exactly as described in the YAML.

### Module Export
```javascript
module.exports = router;
```
*   This exports the router so it can be mounted by `server.js`.
