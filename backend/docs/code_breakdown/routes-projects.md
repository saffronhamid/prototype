# Code Breakdown: `src/routes/projects.routes.js`

This file defines all API endpoints related to **Projects**. It acts as the "traffic director" for any URL starting with `/projects`.

---

## 1. File Purpose & High-Level View

The main purpose of this file is to define the URLs (endpoints) for project-related actions, apply security checks (middleware), and execute the logic for each endpoint. In this file, the logic is written directly inside the route handler, which is common for prototypes.

---

## 2. Connections to Other Files

*   **`src/server.js` (Parent)**: `server.js` imports this file and tells the Express app to use it for any request to `/projects`.
*   **`../middleware/auth.js` (Security)**: It imports `requireAuth` and `requireRole` to protect endpoints.
*   **`../db/inMemory.js` (Database)**: It imports the `projects` and `projectMembers` arrays to read and write project data.

---

## 3. Code Breakdown & OpenAPI Connections

### `GET /projects`
*   **Explanation:** An `ADMIN`-only endpoint to list all projects in the database.
*   **OpenAPI Connection:**
    *   **Path:** `paths./projects.get`
    *   **Implementation:** The code implements the security (`requireRole("ADMIN")`) and returns a list of projects, matching the `ProjectSummary` schema.

### `GET /projects/mine`
*   **Explanation:** A route for a user to see only the projects they are a member of. It checks the `projectMembers` array to filter the list.
*   **OpenAPI Connection:**
    *   **Path:** `paths./projects/mine.get`
    *   **Implementation:** The code checks the user's role and filters the projects based on the `projectMembers` list.

### `GET /projects/search`
*   **Explanation:** Searches for projects based on a `query` parameter, checking against the project's name and description.
*   **OpenAPI Connection:**
    *   **Path:** `paths./projects/search.get`
    *   **Implementation:** The code implements the search by reading the `query` parameter.

### `GET /projects/:projectId/analysis`
*   **Explanation:** A mock endpoint to return a fake analysis of a project. It demonstrates checking for project membership for non-admins.
*   **OpenAPI Connection:**
    *   **Path:** `paths./projects/{projectId}/analysis.post` (Note: YAML uses `POST`, code uses `GET`).
    *   **Implementation:** This implements the analysis concept, returning a mock JSON payload.

### `GET /projects/:id`
*   **Explanation**: Retrieves a single project by its ID, but only if the user is an Admin or a member of that project.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}.get`
    *   **Implementation**: The code finds a project by its ID and enforces the "admins or assigned members" rule.

### `POST /projects`
*   **Explanation**: An `ADMIN`-only endpoint to create a new project. It reads the project data from the request body.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects.post`
    *   **Implementation**: Implements the "Admin-only" rule and reads the `requestBody` to create a new project, returning a `201` status.

### `POST /projects/:id/members`
*   **Explanation**: An `ADMIN`-only endpoint to add a user to a project or update their role.
*   **OpenAPI Connection**: This endpoint **is not defined** in the provided `openapi.yaml`, representing a feature that exists only in the code.

---

### Module Export
```javascript
module.exports = router;
```
*   This line makes the `router` object available for other files to import.
