# Code Breakdown: `src/routes/projects.routes.js`

This file defines all API endpoints related to **Projects**. It acts as the "traffic director" for any URL starting with `/projects`.

---

## 1. File Purpose & High-Level View

The main purpose of this file is to define the URLs (endpoints) for project-related actions, apply security checks (middleware), and execute the logic for each endpoint. In this file, the logic is written directly inside the route handler, which is common for prototypes.

---

## 2. Connections to Other Files

This file is a central hub and connects to:

*   **`src/server.js` (Parent)**: `server.js` imports this file and tells the Express app to use it for any request to `/projects`.
    *   **Code:** `app.use("/projects", projectsRoutes);`
*   **`../middleware/auth.js` (Security)**: It imports `requireAuth` and `requireRole` to protect endpoints. Every route in this file uses at least one of these to ensure the user is logged in and has the correct permissions.
*   **`../db/inMemory.js` (Database)**: It imports the `projects` and `projectMembers` arrays to read and write project data. This acts as its connection to the database.

---

## 3. Code Breakdown & OpenAPI Connections

### Imports
```javascript
const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/auth");
const { projects, projectMembers } = require("../db/inMemory");
```
*   **`express.Router()`**: We create a mini-router. Instead of applying routes to the main `app`, we apply them here. This makes the file modular and reusable.
*   The other imports link to the security and database layers as described above.

---

### `GET /projects`
*   **Code:**
    ```javascript
    router.get("/", requireAuth, requireRole("ADMIN"), (req, res) => {
      return res.json(projects);
    });
    ```
*   **Explanation:**
    1.  `router.get("/")`: Defines a `GET` request for the path `/projects`.
    2.  `requireAuth`, `requireRole("ADMIN")`: These are the **middleware**. They run in order. First, it checks if the user is logged in. Second, it checks if their role is "ADMIN". If either fails, the request is rejected and the main function `(req, res) => {...}` never runs.
    3.  `return res.json(projects)`: If security checks pass, it sends the entire `projects` array back to the user as a JSON response.

*   **OpenAPI Connection:**
    *   **Path:** `paths./projects.get`
    *   **Summary:** `Retrieve all projects`
    *   **Implementation:** The code implements the security (`Admin-only`) by using `requireRole("ADMIN")`. The response is a list of projects, matching the `ProjectSummary` schema.

---

### `GET /projects/mine`
*   **Code:**
    ```javascript
    router.get("/mine", requireAuth, (req, res) => {
      // ... logic to find user's projects ...
    });
    ```
*   **Explanation:**
    1.  `router.get("/mine", ...)`: This route is defined *before* `/:id` because the router matches in order. If `/:id` came first, it would think "mine" is an ID.
    2.  `requireAuth`: Only logged-in users can access this.
    3.  The logic checks if the user is an ADMIN (who can see everything) or filters the `projectMembers` array to find projects matching the logged-in user's ID (`req.user.id`).

*   **OpenAPI Connection:**
    *   **Path:** `paths./projects/mine.get`
    *   **Summary:** `Retrieve authenticated user's projects`
    *   **Implementation:** The code checks the user's role and filters the projects based on the `projectMembers` list, directly fulfilling the requirement.

---

### `GET /projects/search`
*   **Code:**
    ```javascript
    router.get("/search", requireAuth, (req, res) => {
      // ... logic to filter projects by query ...
    });
    ```
*   **Explanation:**
    1.  `req.query.query`: It reads the search term from the URL (e.g., `/projects/search?query=rental`).
    2.  It first determines which projects are accessible to the user (all for ADMIN, or just their own for others).
    3.  It then filters this accessible list by checking if the search term appears in the project's name or description.

*   **OpenAPI Connection:**
    *   **Path:** `paths./projects/search.get`
    *   **Summary:** `Search and filter projects`
    *   **Implementation:** The code implements the search by reading the `query` parameter and returning a filtered list of projects.

---

### `GET /projects/:id`
*   **Code:**
    ```javascript
    router.get("/:id", requireAuth, (req, res) => {
      // ... logic to find a specific project by ID ...
    });
    ```
*   **Explanation:**
    1.  `/:id`: The colon `:` means that this part of the URL is a variable. It can be accessed via `req.params.id`.
    2.  `projects.find(...)`: It searches the database array for a project with the matching ID.
    3.  The logic then checks if the user is an ADMIN or a member of that specific project before returning the data.

*   **OpenAPI Connection:**
    *   **Path:** `paths./projects/{projectId}.get`
    *   **Summary:** `Get project details`
    *   **Implementation:** The code finds a project by its ID from the path (`req.params.id`). It enforces the "admins or assigned managers/developers" rule by checking `req.user.role` and the `projectMembers` array.

---

### `POST /projects`
*   **Code:**
    ```javascript
    router.post("/", requireAuth, requireRole("ADMIN"), (req, res) => {
      // ... logic to create a new project ...
    });
    ```
*   **Explanation:**
    1.  `router.post(...)`: This handles a `POST` request, used for creating new data.
    2.  `req.body`: It reads the new project data (name, description, etc.) from the JSON body of the request.
    3.  It constructs a `newProject` object, gives it a new ID, and `.push()`es it into the `projects` array.
    4.  `res.status(201)`: It returns a `201 Created` status code, which is the correct HTTP standard for a successful creation.

*   **OpenAPI Connection:**
    *   **Path:** `paths./projects.post`
    *   **Summary:** `Create a new project`
    *   **Implementation:** The code implements the "Admin-only" rule with `requireRole("ADMIN")`. It reads the project data from the request body (`ProjectInput` schema) and returns the newly created project (`ProjectDetail` schema) with a `201` status.

---

### `POST /projects/:id/members`
*   **Code:**
    ```javascript
    router.post("/:id/members", requireAuth, requireRole("ADMIN"), (req, res) => {
      // ... logic to add a user to a project ...
    });
    ```
*   **Explanation:**
    *   This is an example of a **nested route**. It operates on the `members` of a specific project.
    *   It's `ADMIN`-only.
    *   It reads `userId` and `projectRole` from the request body.
    *   It checks if the user is already a member. If so, it updates their role. If not, it adds a new entry to the `projectMembers` array.

*   **OpenAPI Connection:**
    *   This specific endpoint **is not defined** in the provided `openapi.yaml`. This is an example of a potential API endpoint that exists in the code but has not yet been documented in the official specification. This is common during development.

---

### Module Export
```javascript
module.exports = router;
```
*   **Explanation:** This line makes the `router` object available for other files to import. This is how `src/server.js` is able to load and use this file.
