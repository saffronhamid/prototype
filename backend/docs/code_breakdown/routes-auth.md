# Code Breakdown: `src/routes/auth.routes.js`

This file defines the API endpoints related to **authentication actions**, such as logging in and accepting an invitation.

---

## 1. File Purpose & High-Level View

The purpose of this file is to act as a dedicated router for authentication-related URLs. It imports the controller logic from other files and maps it to specific `POST` endpoints. This keeps the authentication logic separate from other application concerns like projects or users.

---

## 2. Connections to Other Files

*   **`src/server.js` (Parent)**: Imports this router and mounts it at the `/auth` path.
*   **`../controllers/auth.controller.js` (Logic)**: Imports the `login` function to handle the login process.
*   **`../controllers/acceptInvitation.controller.js` (Logic)**: Imports the `acceptInvitation` function to handle the final step of a user joining.
*   **`express` (Library)**: Uses the `express.Router()` functionality to create a modular router.

---

## 3. Code Breakdown & OpenAPI Connections

### Boilerplate and Imports
```javascript
const express = require("express");
const router = express.Router();
const { acceptInvitation } = require("../controllers/acceptInvitation.controller");
const { login } = require("../controllers/auth.controller");
```
*   The file imports the necessary controller functions that contain the actual business logic. The role of this file is just to connect those functions to a URL.

### Route Definitions

#### `POST /auth/login`
*   **Code:**
    ```javascript
    router.post("/login", login);
    ```
*   **Explanation:** This line maps an incoming `POST` request on the path `/auth/login` directly to the `login` function from `auth.controller.js`. The Express framework automatically passes the `(req, res)` arguments to the `login` function when a request hits this endpoint.

*   **OpenAPI Connection:**
    *   **Path:** `paths./auth/login.post`
    *   **Implementation:** This line of code directly wires the URL defined in the OpenAPI spec to the controller function that implements its logic.

#### `POST /auth/accept-invitation`
*   **Code:**
    ```javascript
    router.post("/accept-invitation", acceptInvitation);
    ```
*   **Explanation:** Similar to the login route, this maps a `POST` request on `/auth/accept-invitation` to the `acceptInvitation` controller function.

*   **OpenAPI Connection:**
    *   **Path:** `paths./auth/accept-invitation.post`
    *   **Implementation:** This line connects the URL from the OpenAPI spec to its corresponding controller logic.

### Module Export
```javascript
module.exports = router;
```
*   This exports the fully configured router object so that `server.js` can import it and mount it at the `/auth` path.
