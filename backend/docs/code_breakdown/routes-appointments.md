# Code Breakdown: `src/routes/appointments.routes.js`

This file defines all API endpoints related to **Appointments** within a specific project. It is mounted under the `/projects` prefix, creating nested routes like `/projects/:projectId/appointment`.

---

## 1. File Purpose & High-Level View

The purpose of this file is to handle all CRUD (Create, Read, Update, Delete) and search operations for appointments. It ensures that a user can only interact with appointments for projects they are a member of.

---

## 2. Connections to Other Files

*   **`src/server.js` (Parent)**: Imports this router and mounts it at the `/projects` path.
*   **`../middleware/auth.js` (Security)**: Imports `requireAuth` to protect all endpoints.
*   **`../db/inMemory.js` (Database)**: Imports `projects`, `projectMembers`, and `appointments` to manage data.

---

## 3. Code Breakdown & OpenAPI Connections

### Helper Functions
*   **`canAccessProject(req, projectId)`**: A crucial security helper. It checks if the current user (`req.user`) is an `ADMIN` or if they have a record in the `projectMembers` array for the given `projectId`.
*   **`ensureProjectExists(projectId)`**: A validation helper to check if a project with the given ID exists in the `projects` array, preventing operations on non-existent projects.

### `GET /:projectId/appointment`
*   **Explanation**: Lists all appointments for a given `projectId` after verifying the user has access to that project.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}/appointment.get`
    *   **Implementation**: This endpoint returns an array of appointments, which aligns with the intent, although the YAML schema suggests a `{ data: [...] }` wrapper. The security checks implement the authorization requirement.

### `POST /:projectId/appointment/create`
*   **Explanation**: Creates a new appointment. It validates the request body for required fields (`title`, `startAt`, `endAt`) and correct date formats.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}/appointment/create.post`
    *   **Implementation**: Directly implements the creation logic. It validates the `requestBody`, which corresponds to the `appointment` schema, and returns the new appointment with a `201` status.

### `POST /:projectId/appointment/update`
*   **Explanation**: Partially updates an existing appointment. It finds the appointment by its `id` and applies any provided changes (`title`, `startAt`, etc.).
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}/appointment/update.put` (Note: YAML uses `PUT`, code uses `POST`).
    *   **Implementation**: Implements the update logic. It finds the appointment to update based on an `id` in the request body.

### `POST /:projectId/appointment/delete`
*   **Explanation**: Deletes an appointment from the `appointments` array based on its ID.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}/appointment/delete.delete` (Note: YAML uses `DELETE`, code uses `POST`).
    *   **Implementation**: Implements the deletion logic, returning a `204 No Content` on success.

### `GET /:projectId/appointment/search`
*   **Explanation**: Searches the title, location, and notes of appointments within a specific project for a given query string.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}/appointment/search.get`
    *   **Implementation**: Implements the search functionality based on the `q` query parameter.

---

### Module Export
```javascript
module.exports = router;
```
*   Exports the router for use in `server.js`.
