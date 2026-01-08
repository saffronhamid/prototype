# Code Breakdown: `src/middleware/projectAccess.js`

This file provides a specialized authorization middleware for checking if a user has access to a specific **project**.

---

## 1. File Purpose & High-Level View

While `src/middleware/auth.js` handles general authentication (Are you logged in?) and system-level roles (Are you an Admin?), this file handles **resource-specific authorization**. Its purpose is to answer the question: "Even though you're a valid user, are you a *member* of the specific project you're trying to access?"

This prevents a user who is a member of Project A from being able to see data from Project B.

---

## 2. Connections to Other Files

*   **`../db/inMemory.js` (Database)**: Its primary dependency. It imports the `projectMembers` array to check for membership records.
*   **Consumers (Route Files)**: This middleware is intended for use in route files that deal with specific projects, most notably `src/routes/projects.routes.js`, `src/routes/appointments.routes.js`, and `src/routes/comments.routes.js` on endpoints that include a `:projectId` or `:id` parameter.

---

## 3. Code Breakdown & OpenAPI Connections

### `requireProjectRole(...allowedProjectRoles)`
This function is a middleware factory, similar to `requireRole` in `auth.js`. It returns a middleware function tailored to the allowed project roles.

*   **Code:**
    ```javascript
    function requireProjectRole(...allowedProjectRoles) {
      return (req, res, next) => {
        const projectId = req.params.id; // Assumes project ID is in req.params.id
        const userId = req.user?.id;

        const membership = projectMembers.find(
          (m) => m.projectId === projectId && m.userId === userId
        );

        if (!membership) {
          // ... reject
        }
        // ... more checks
        return next();
      };
    }
    ```
*   **Explanation:**
    1.  **`...allowedProjectRoles`**: It accepts a list of project-specific roles, e.g., `requireProjectRole("MANAGER")`. If called with no arguments (`requireProjectRole()`), it will only check for membership.
    2.  **`req.params.id`**: It assumes the project's ID is being passed as a URL parameter. **Note:** This might need to be adjusted if the parameter is named `:projectId`.
    3.  **`projectMembers.find(...)`**: This is the core logic. It searches the "database" to find a record linking the current user to the current project.
    4.  **`if (!membership)`**: If no record is found, the user is not a member, and the middleware rejects the request with a `403 Forbidden` error.
    5.  **Role Check**: It can perform a second check to ensure the user's role within that project (e.g., `DEVELOPER`) is sufficient.
    6.  **`next()`**: If all checks pass, it allows the request to proceed.

*   **OpenAPI Connection**:
    *   This middleware is the implementation for the authorization rules described in various `Project Management` endpoints.
    *   **Example**: For `paths./projects/{projectId}.get`, the description says "Only admins or assigned managers/developers may access." This middleware helps enforce that rule.
    *   The `403 Forbidden` responses for not being a project member are returned from this middleware.

---

### Module Export
```javascript
module.exports = { requireProjectRole };
```
*   This exposes the middleware factory so it can be used in project-related routes.
