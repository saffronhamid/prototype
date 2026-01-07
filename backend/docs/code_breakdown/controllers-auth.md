# Code Breakdown: `src/controllers/auth.controller.js`

This file handles the core business logic for user **authentication**, specifically logging in.

---

## 1. File Purpose & High-Level View

The primary purpose of this controller is to implement the logic for the `POST /auth/login` endpoint. This includes:
1.  Receiving an `identifier` (username or email) and a `password`.
2.  Finding the corresponding user in the database.
3.  Securely comparing the provided password with the stored password hash.
4.  If the credentials are valid, generating a signed JSON Web Token (JWT).
5.  Returning the JWT and some basic user information.

---

## 2. Connections to Other Files

*   **`jsonwebtoken`, `bcrypt` (Libraries)**: These are used for signing JWTs and comparing password hashes, respectively. They are the core of the security logic.
*   **`../db/inMemory.js` (Database)**: It imports the `users` array to find the user and access their stored `passwordHash`.
*   **`../routes/auth.routes.js` (Consumer)**: This controller's `login` function is imported by the auth router and assigned to the `POST /login` path.

---

## 3. Code Breakdown & OpenAPI Connections

### `safeUser(u)`
*   **Code:**
    ```javascript
    function safeUser(u) {
      const { passwordHash, ...rest } = u;
      return rest;
    }
    ```
*   **Explanation:** A small but critical helper function. It takes a user object from the database and returns a new object containing all of its properties *except* for `passwordHash`. This ensures that we never accidentally send sensitive information like a password hash to the client.

### `login(req, res)`
This is the main controller function for handling a login attempt.

*   **Code:**
    ```javascript
    async function login(req, res) {
      try {
        // ...
      } catch (err) {
        // ...
      }
    }
    ```
*   **Explanation:**
    1.  **`try...catch` block**: This is good practice for `async` functions. If any `await` operation fails or another unexpected error occurs, the `catch` block will prevent the server from crashing and send a generic `500 Server error` response.
    2.  **Input Validation**: It checks that `identifier` and `password` were actually sent in the request body.
    3.  **User Lookup**: `users.find(...)` searches the database for a user whose `username` or `email` matches the provided `identifier`.
    4.  **Credential Check**: `await bcrypt.compare(password, user.passwordHash)` is the key security step. It safely compares the plain-text password from the user with the stored hash. It returns `true` if they match. **It never decrypts the hash.**
    5.  **Token Generation**: `jwt.sign(...)` creates the token.
        *   **Payload**: `{ sub: user.id, role: user.role }`. This is the data we are embedding in the token. `sub` (subject) is a standard claim for the user's ID.
        *   **Secret**: `process.env.JWT_SECRET`. The secret key used to sign the token, proving that we are the ones who issued it.
        *   **Options**: `{ expiresIn: "2h" }`. This token will automatically become invalid after 2 hours.
    6.  **Success Response**: It returns a `200 OK` response with the `token` and the "safe" user object.

*   **OpenAPI Connection**:
    *   **Path:** `paths./auth/login.post`
    *   **Summary:** `Log in with username or email and password`
    *   **Implementation:** This function is the direct implementation of that endpoint.
        *   The `requestBody` schema (requiring `identifier` and `password`) is validated at the top of the function.
        *   The `400`, `401`, and `500` error responses are all handled within the function's logic.
        *   The `200` success response, which returns a `{ token, user }` object, perfectly matches the schema defined in the YAML. The `user` part of the response corresponds to the `User` schema.

---

### Module Export
```javascript
module.exports = { login };
```
*   This exposes the `login` function so it can be used by `auth.routes.js`.
