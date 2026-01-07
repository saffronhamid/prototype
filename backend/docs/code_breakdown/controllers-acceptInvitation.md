# Code Breakdown: `src/controllers/acceptInvitation.controller.js`

This file contains the business logic for the final step of the user invitation process: **creating a new user account based on a pending invitation**.

---

## 1. File Purpose & High-Level View

The primary purpose of this file is to handle the logic for the `POST /auth/accept-invitation` endpoint. This involves:
1.  Validating the invitation ID and the new user's details (username, password, etc.).
2.  Checking that the invitation is valid and hasn't already been used.
3.  Ensuring the chosen username isn't already taken.
4.  Creating a new user record in the database, including hashing the password.
5.  If applicable, adding the new user to a project they were invited to.
6.  Marking the invitation as "ACCEPTED."

---

## 2. Connections to Other Files

*   **`bcrypt` (Library)**: Used to securely hash the new user's password before saving it.
*   **`../db/inMemory.js` (Database)**: Imports `invitations`, `users`, and `projectMembers` to read invitation data and write new user and membership data.
*   **`../routes/auth.routes.js` (Consumer)**: This controller is imported and used by the auth router to handle the `POST /accept-invitation` request.

---

## 3. Code Breakdown & OpenAPI Connections

### `mapRole(yamlRole)`
*   **Code:**
    ```javascript
    function mapRole(yamlRole) {
      return yamlRole === "admin" ? "ADMIN" : "END_USER";
    }
    ```
*   **Explanation:** A simple helper function to translate the role string from the API/YAML (`"admin"`) to the internal representation used in the database (`"ADMIN"`).

### `acceptInvitation(req, res)`
This is the main controller function.

*   **Code:**
    ```javascript
    async function acceptInvitation(req, res) {
      // ...
    }
    ```
*   **Explanation:**
    1.  **Destructure `req.body`**: It pulls all the required fields from the request body.
    2.  **Input Validation**: It checks if all required fields were provided. If not, it returns a `400 Bad Request` error.
    3.  **Invitation Check**: It finds the invitation in the `invitations` array. It returns a `404 Not Found` if the ID is invalid, or a `400 Bad Request` if the invitation has already been used.
    4.  **Uniqueness Checks**: It ensures the chosen `username` and the invitation's `email` are not already registered in the `users` array. This prevents duplicate accounts.
    5.  **Password Hashing**: `await bcrypt.hash(password, 10)` securely hashes the user's new password. The `await` keyword pauses the function until the hashing is complete.
    6.  **Create New User**: It constructs a `newUser` object and pushes it to the `users` array.
    7.  **Add Project Membership**: If the invitation included a `projectId`, it automatically adds the new user to that project by creating a `projectMembers` record.
    8.  **Update Invitation Status**: It marks the invitation as `ACCEPTED` and records the timestamp. This prevents it from being used again.
    9.  **Return Success Response**: It returns a `201 Created` status with a success message and the new user's ID.

*   **OpenAPI Connection**:
    *   **Path:** `paths./auth/accept-invitation.post`
    *   **Summary:** `Create an account using an invitation`
    *   **Implementation:** This function is the direct implementation of that endpoint.
        *   The `requestBody` schema in OpenAPI (requiring `invitationId`, `username`, `password`, etc.) is validated at the top of the function.
        *   The `400`, `404`, and `201` responses defined in the YAML are all returned by this function based on the logic's outcome.
        *   The returned JSON `{ message, userId }` perfectly matches the `201` response schema in the YAML.

---

### Module Export
```javascript
module.exports = { acceptInvitation };
```
*   This exposes the controller function so it can be imported and used by `auth.routes.js`.
