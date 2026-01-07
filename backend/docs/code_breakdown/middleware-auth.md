# Code Breakdown: `src/middleware/auth.js`

This file provides the core **authentication and authorization** middleware for the application. Its functions act as security guards that inspect requests before they are allowed to proceed to the actual business logic (controllers).

---

## 1. File Purpose & High-Level View

The purpose of this file is to:
1.  **Authenticate Users**: Verify that a request comes from a logged-in user with a valid JSON Web Token (JWT).
2.  **Authorize Users**: Check if the authenticated user has the correct *role* (e.g., `ADMIN`) to access a specific endpoint.

These middleware functions are designed to be plugged into any route that needs protection.

---

## 2. Connections to Other Files

*   **`jsonwebtoken` (Library)**: Used to verify and decode JWTs.
*   **`process.env.JWT_SECRET` (from `.env`)**: It reads the secret key from the environment to ensure tokens are valid.
*   **Consumers (Route Files)**: This file is a dependency for nearly every route file in `src/routes/`. Any route that requires a user to be logged in will import and use `requireAuth`. Any route restricted to admins will use `requireRole`.

---

## 3. Code Breakdown & OpenAPI Connections

### `requireAuth(req, res, next)`
This function is the primary authentication middleware.

*   **Code:**
    ```javascript
    function requireAuth(req, res, next) {
      const header = req.headers.authorization || "";
      const [type, token] = header.split(" ");

      if (type !== "Bearer" || !token) {
        // ... reject
      }

      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.sub, role: payload.role };
        return next();
      } catch (err) {
        // ... reject
      }
    }
    ```
*   **Explanation:**
    1.  **`req.headers.authorization`**: It looks for the `Authorization` header in the incoming request.
    2.  **`Bearer <token>`**: It expects the header value to be in the format `Bearer eyJhbGci...`. It splits this string to isolate the `token`.
    3.  **`jwt.verify(...)`**: This is the most critical step. It uses the `JWT_SECRET` to check if the token's signature is valid. If the token is tampered with or expired, this function will throw an error.
    4.  **`req.user = ...`**: If verification is successful, it decodes the token's payload (which contains the user's ID and role) and **attaches it to the `req` object**. This is how downstream functions (like controllers) know who the current user is.
    5.  **`next()`**: This function is the signal to Express to proceed to the *next* middleware in the chain, or to the final route handler if there are no more. If `next()` is not called, the request will hang indefinitely.

*   **OpenAPI Connection**:
    *   This middleware is the implementation for the `securitySchemes` defined in `openapi.yaml`, specifically the `bearerAuth` scheme. Any endpoint in the YAML marked with `security: - bearerAuth: []` is protected by this `requireAuth` function. The `401` error responses for "Missing or invalid token" are returned directly from this middleware.

---

### `requireRole(...roles)`
This function is a **middleware factory**. It's a function that *returns* another function (the actual middleware).

*   **Code:**
    ```javascript
    function requireRole(...roles) {
      return (req, res, next) => {
        if (!req.user) // ... reject
        if (!roles.includes(req.user.role)) {
          // ... reject
        }
        return next();
      };
    }
    ```
*   **Explanation:**
    1.  **`...roles`**: It accepts a list of allowed roles, e.g., `requireRole("ADMIN")` or `requireRole("ADMIN", "MANAGER")`.
    2.  **Closure**: It returns a new middleware function that has access to the `roles` argument from its parent.
    3.  **`req.user`**: It assumes `requireAuth` has already run and attached the `user` object to the request.
    4.  **`!roles.includes(...)`**: It checks if the user's role is in the list of allowed roles. If not, it rejects the request with a `403 Forbidden` error.

*   **OpenAPI Connection**:
    *   This middleware implements the role-based access control described in the `description` or `summary` of many endpoints (e.g., "Admin-only endpoint"). The `403 Forbidden` responses for insufficient permissions are often returned from this middleware.

---

### Module Export
```javascript
module.exports = { requireAuth, requireRole };
```
*   This exposes the two middleware functions so they can be imported and used in the `src/routes/` files.
