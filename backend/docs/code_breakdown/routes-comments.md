# Code Breakdown: `src/routes/comments.routes.js`

This file defines all API endpoints related to **Comments** within a specific project. It is mounted under the `/projects` prefix, creating nested routes like `/projects/:projectId/comments`.

---

## 1. File Purpose & High-Level View

The purpose of this file is to handle all CRUD (Create, Read, Update, Delete) and search operations for comments. It enforces security rules, ensuring that users can only interact with comments in projects they belong to, and can only edit or delete their own comments (unless they are an admin).

---

## 2. Connections to Other Files

*   **`src/server.js` (Parent)**: Imports this router and mounts it at the `/projects` path.
*   **`../middleware/auth.js` (Security)**: Imports `requireAuth` to protect all endpoints.
*   **`../db/inMemory.js` (Database)**: Imports `projects`, `projectMembers`, and `comments` to manage data.

---

## 3. Code Breakdown & OpenAPI Connections

### Helper Functions
*   **`canAccessProject(req, projectId)`**: Checks if the user is an admin or a member of the project.
*   **`ensureProjectExists(projectId)`**: Validates that the project ID exists.

### `GET /:projectId/comments`
*   **Explanation**: Lists all comments for a project, sorted by creation date.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}/comments.get`
    *   **Implementation**: Implements the listing functionality. The YAML describes a `visibility` filter which is not present in this specific implementation, representing a slight divergence.

### `POST /:projectId/comments`
*   **Explanation**: Creates a new comment. It validates that the `text` field is not empty.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}/comments.post`
    *   **Implementation**: Directly implements comment creation. The `requestBody` corresponds to the `CommentCreateRequest` schema (though this implementation only uses the `text` field).

### `GET /:projectId/comments/:commentId`
*   **Explanation**: Retrieves a single comment by its ID.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}/comments/{commentId}.get`
    *   **Implementation**: Implements fetching a single comment.

### `PATCH /:projectId/comments/:commentId`
*   **Explanation**: Updates a comment's text. It includes an important security check: only the original author of the comment or an `ADMIN` can perform the update.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}/comments/{commentId}.put` (Note: YAML uses `PUT`, code uses `PATCH` which is more appropriate for partial updates).
    *   **Implementation**: Implements the update logic, including the "author only" security rule.

### `DELETE /:projectId/comments/:commentId`
*   **Explanation**: Deletes a comment. It also enforces the "author or admin" security rule.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}/comments/{commentId}.delete`
    *   **Implementation**: Implements the deletion logic with correct security and a `204 No Content` success response.

### `GET /:projectId/comments/search`
*   **Explanation**: Searches the text of comments within a project.
*   **OpenAPI Connection**:
    *   **Path**: `paths./projects/{projectId}/comments/search.get`
    *   **Implementation**: Implements comment searching via the `q` query parameter.

---

### Module Export
```javascript
module.exports = router;
```
*   Exports the router for use in `server.js`.
