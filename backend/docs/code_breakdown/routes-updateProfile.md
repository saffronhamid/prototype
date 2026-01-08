# Code Breakdown: `src/routes/updateProfile.routes.js`

This file defines the API endpoint for an authenticated user to **update their own profile information**. It uses the `PATCH` method for partial updates.

---

## 1. File Purpose & High-Level View

The purpose of this file is to handle the `PATCH /update-profile` request. It allows a logged-in user to change certain fields (`username`, `firstName`, `lastName`) without having to provide all of them.

It is mounted at `/update-profile` in `server.js`.

---

## 2. Connections to Other Files

*   **`src/server.js` (Parent)**: Imports this router and mounts it.
*   **`../middleware/auth.js` (Security)**: Imports `requireAuth` to ensure only a logged-in user can update their own profile.
*   **`../db/inMemory.js` (Database)**: Imports the `users` array to find and modify the user's record.

---

## 3. Code Breakdown & OpenAPI Connections

### `safeUser(u)`
*   **Purpose**: A helper function to remove the `passwordHash` from the user object before sending it back in the response.

### Route Definition: `PATCH /`
The full path is `/update-profile` as defined in `server.js`.

*   **Explanation:**
    1.  `router.patch("/")`: Defines a handler for the `PATCH` HTTP method, which is correct for partial updates.
    2.  `requireAuth`: Middleware to ensure the user is authenticated.
    3.  `const patch = req.body || {}`: It gets the JSON body containing only the fields the user wants to change.
    4.  **Field-by-Field Update**: The code checks for each supported field (`username`, `firstName`, `lastName`) and only applies changes for the fields present in the request. It includes validation, such as checking for username uniqueness.
    5.  **Return Updated User**: After applying all patches, it returns the full, updated user object (after cleaning with `safeUser`).

*   **OpenAPI Connection:**
    *   **Path:** In `openapi.yaml`, this functionality is mapped to `PUT /update-profile`. While the YAML uses `PUT`, the code implements it as `PATCH`, which is arguably more correct for this use case. The `application/merge-patch+json` content type in the YAML aligns with a partial update.
    *   **Summary:** `Update user profile`
    *   **Implementation:**
        *   The logic directly implements the "update own account" feature.
        *   The `requestBody` schema (`MyAccountUpdate`) is what the code expects in `req.body`.
        *   The `200` success response returns the updated `User` object, matching the spec.

### Module Export
```javascript
module.exports = router;
```
*   Exports the router for use in `server.js`.
