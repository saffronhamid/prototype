# Code Breakdown: `src/routes/profile.routes.js`

This file defines the API endpoint for a user to **retrieve their own profile information**.

---

## 1. File Purpose & High-Level View

The purpose of this file is to handle the `GET /profile` request. It provides a secure way for authenticated users to get their own user object from the database, without exposing sensitive information like the password hash.

It is mounted at `/profile` in `server.js`.

---

## 2. Connections to Other Files

*   **`src/server.js` (Parent)**: Imports this router and mounts it at the `/profile` path.
*   **`../middleware/auth.js` (Security)**: Imports `requireAuth` to ensure only logged-in users can access their profile.
*   **`../db/inMemory.js` (Database)**: Imports the `users` array to find the user's record.

---

## 3. Code Breakdown & OpenAPI Connections

### `safeUser(u)`
*   **Explanation:** A helper function to strip the `passwordHash` from the user object before sending it to the client, which is a critical security measure.

### Route Definition: `GET /`
The full path is `/profile` as defined in `server.js`.

*   **Code:**
    ```javascript
    router.get("/", requireAuth, (req, res) => {
      const me = users.find((u) => u.id === req.user.id);
      if (!me) return res.status(404).json({ message: "User not found" });
      return res.json(safeUser(me));
    });
    ```
*   **Explanation:**
    1.  `router.get("/")`: Defines a `GET` request handler for the root of this router.
    2.  `requireAuth`: This middleware runs first, authenticating the user via their JWT and attaching their info to `req.user`.
    3.  **Find User**: It uses the ID from the token (`req.user.id`) to find the corresponding user in the `users` array.
    4.  **Error Handling**: If for some reason the user from the token doesn't exist in the database, it returns a `404 Not Found`.
    5.  **Return User**: It calls `safeUser()` to remove the password hash and then returns the cleaned user object as a JSON response.

*   **OpenAPI Connection:**
    *   **Path:** `paths./profile.get`
    *   **Summary:** `Display user profile`
    *   **Implementation:**
        *   This route directly implements the endpoint.
        *   The security is handled by `requireAuth`, matching the spec.
        *   The `200` success response returns a user object that corresponds to the `User` schema defined in `components/schemas/User`.
        *   The `401` error is handled by the `requireAuth` middleware.

### Module Export
```javascript
module.exports = router;
```
*   This exports the router to be mounted by `server.js`.
