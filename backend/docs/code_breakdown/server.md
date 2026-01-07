# Code Breakdown: `src/server.js`

This file is the **main entry point** and central nervous system of the entire application. When you run `npm run dev`, this is the file that Node.js executes.

---

## 1. File Purpose & High-Level View

The purpose of `server.js` is to:
1.  Initialize the Express web server.
2.  Load environment variables from the `.env` file.
3.  Apply global middleware (like `cors` and `express.json`).
4.  Import all the different route files from the `src/routes/` directory.
5.  Map each route file to a specific URL prefix (e.g., `/projects`, `/users`).
6.  Start the server to listen for incoming HTTP requests on a specific port.

---

## 2. Connections to Other Files

This file is the top-level "parent" and connects to almost everything else, primarily the **Route** files.

*   **`dotenv` (Library)**: Used to load variables from `.env`.
*   **`express`, `cors` (Libraries)**: The core web framework and security middleware.
*   **`./routes/*.js` (Children)**: It imports every single route file (`auth.routes.js`, `projects.routes.js`, etc.) to build the complete API. Each `require(...)` statement is a direct dependency.

---

## 3. Code Breakdown & OpenAPI Connections

### Boilerplate and Imports
```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
// ... all route imports
const authRoutes = require("./routes/auth.routes");
// ...
```
*   **`require("dotenv").config()`**: This must be called at the very top to ensure that `process.env.PORT` and `process.env.JWT_SECRET` are available to the rest of the application.
*   **`const app = express()`**: This creates the main application object.

### Global Middleware
```javascript
app.use(cors());
app.use(express.json({ type: ["application/json", "application/merge-patch+json"] }));
```
*   **`app.use(cors())`**: Enables Cross-Origin Resource Sharing. This is a security feature that browsers enforce. This line tells the server it's okay to accept requests from web pages hosted on different domains (e.g., your React frontend running on `localhost:3000` can talk to this server on `localhost:3001`).
*   **`app.use(express.json(...))`**: This is the body parser. It intercepts incoming requests and if they have a `Content-Type` of `application/json` (or `merge-patch+json`), it automatically parses the JSON string into a usable JavaScript object, which becomes `req.body`. Without this, `req.body` would be undefined.

### Route Mounting
```javascript
app.use("/auth", authRoutes);
app.use("/projects", projectsRoutes);
app.use("/users", usersRoutes);
app.use("/profile", profileRoutes);
// ... and so on
```
*   **`app.use("/prefix", routerFile)`**: This is the core of the application's structure. It tells Express: "For any request whose URL starts with `/prefix`, hand it over to the `routerFile` to handle."
*   **Order of `/users` routes**: You'll notice multiple `app.use("/users", ...)` lines. This works because each file (`users.byId.routes.js`, `users.anonymize.routes.js`) handles a more specific sub-path. Express will try to match the full path within each of these routers. For example, a request to `/users/u1/anonymize` will be correctly routed to the handler in `users.anonymize.routes.js`.

### Server Start
```javascript
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
```
*   **`process.env.PORT || 3001`**: It tries to get the port from the `.env` file. If it's not defined, it defaults to `3001`.
*   **`app.listen(...)`**: This is the command that officially starts the server and makes it listen for incoming requests. The callback function `() => {...}` is executed once the server is successfully running.

### OpenAPI Connection
This file doesn't implement any single endpoint, but it's responsible for **hosting the entire API** defined in `openapi.yaml`. The path prefixes used in `app.use()` (e.g., `/projects`, `/users`, `/auth`) directly correspond to the top-level paths in the `openapi.yaml` document.
