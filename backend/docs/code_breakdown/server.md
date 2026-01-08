# Code Breakdown: `src/server.js`

This file is the **main entry point** and central nervous system of the entire application. When you run `npm run dev`, this is the file that Node.js executes.

---

## 1. File Purpose & High-Level View

The purpose of `server.js` is to:
1.  Initialize the Express web server.
2.  Load environment variables from the `.env` file.
3.  Apply global middleware (like `cors` and `express.json`).
4.  Import all the different route files from the `src/routes/` directory.
5.  Map each route file to a specific URL prefix (e.g., `/projects`, `/users`, `/settings`).
6.  Serve the OpenAPI/Swagger documentation UI.
7.  Start the server to listen for incoming HTTP requests on a specific port.

---

## 2. Connections to Other Files

This file is the top-level "parent" and connects to almost everything else, primarily the **Route** files.

*   **`dotenv` (Library)**: Used to load variables from `.env`.
*   **`express`, `cors`, `swagger-ui-express`, `yamljs` (Libraries)**: The core web framework and helper libraries for documentation.
*   **`./routes/*.js` (Children)**: It imports every single route file (`auth.routes.js`, `projects.routes.js`, etc.) to build the complete API. Each `require(...)` statement is a direct dependency.
*   **`../docs/api/openapi.yaml` (Documentation)**: It loads the YAML file to generate the interactive API documentation page.

---

## 3. Code Breakdown & OpenAPI Connections

### Boilerplate and Imports
```javascript
require("dotenv").config();
// ... other library imports
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
*   **`app.use(cors())`**: Enables Cross-Origin Resource Sharing. This allows your frontend application (on a different domain/port) to make requests to this backend.
*   **`app.use(express.json(...))`**: The body parser. It automatically parses incoming JSON request bodies and makes them available on the `req.body` object.

### Route Mounting
```javascript
app.use("/auth", authRoutes);
app.use("/projects", projectsRoutes);
app.use("/users", usersRoutes);
app.use("/settings", settingsRoutes);
// ... and so on
```
*   **`app.use("/prefix", routerFile)`**: This is the core of the application's structure. It tells Express: "For any request whose URL starts with `/prefix`, hand it over to the `routerFile` to handle."
*   **Mounting multiple routers on `/projects`**: The code has `app.use("/projects", appointmentsRoutes)` and `app.use("/projects", commentsRoutes)`. This works because Express merges them. A request for `/projects/p1/comments` will be correctly handled by `comments.routes.js`.

### API Documentation
```javascript
const swaggerDocument = YAML.load(
  path.join(__dirname, "../docs/api/openapi.yaml")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```
*   This block sets up an interactive API documentation page available at the `/api-docs` URL. It uses the `openapi.yaml` file as the source of truth.

### Server Start
```javascript
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
```
*   This is the command that officially starts the server and makes it listen for incoming requests.

### OpenAPI Connection
This file doesn't implement any single endpoint, but it's responsible for **hosting the entire API** defined in `openapi.yaml`. The path prefixes used in `app.use()` directly correspond to the top-level paths in the `openapi.yaml` document.
