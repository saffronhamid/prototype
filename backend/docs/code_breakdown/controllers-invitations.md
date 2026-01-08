# Code Breakdown: `src/controllers/invitations.controller.js`

This file contains the business logic for the first step of the user invitation process: **creating a new invitation**.

---

## 1. File Purpose & High-Level View

The main purpose of this controller is to handle the logic for the `POST /users/invite` endpoint. This involves:
1.  Validating the request body (email, role, optional projectId).
2.  Ensuring the provided `projectId` (if any) actually exists.
3.  Generating a unique invitation ID.
4.  Creating a new invitation record and storing it in the database with a "PENDING" status.
5.  Returning the new invitation ID to the caller.

In a real application, this is also where an email would be sent to the invited user. For this prototype, we simulate that by just returning the ID.

---

## 2. Connections to Other Files

*   **`../db/inMemory.js` (Database)**: It imports the `invitations` and `projects` arrays to create new invitation records and to validate that projects exist.
*   **`../routes/users.routes.js` (Consumer)**: This controller's `inviteUser` function is imported and used by the user router to handle the `POST /invite` request.

---

## 3. Code Breakdown & OpenAPI Connections

### `makeId()`
*   **Explanation:** A simple helper function to generate a reasonably unique, random-looking ID string for the invitation, prefixed with `inv-`.

### `inviteUser(req, res)`
This is the main controller function for creating an invitation.

*   **Explanation:**
    1.  **Input Validation**: It checks the `email` and `role` from the request body to ensure they exist and are valid.
    2.  **Project Validation**: If a `projectId` is provided, it checks the `projects` array to make sure the project actually exists.
    3.  **ID Generation**: It calls `makeId()` to create a new, unique ID.
    4.  **Create Invitation Object**: It constructs a new object representing the invitation, setting its `status` to `"PENDING"`.
    5.  **Save to DB**: It `.push()`es the new invitation object into the `invitations` array.
    6.  **Return Success Response**: It returns a `201 Created` status along with a success message and the `invitationId`.

*   **OpenAPI Connection**:
    *   **Path:** `paths./users/invite.post`
    *   **Summary:** `Invite a new user by email`
    *   **Implementation:** This function directly implements that endpoint.
        *   The `requestBody` schema (requiring `email`, `role`, and an optional `projectId`) is validated by the function's logic.
        *   The `400` error responses for invalid input are handled by the validation checks.
        *   The `201` success response, which returns `{ message, invitationId }`, perfectly matches the schema defined in the YAML.

---

### Module Export
```javascript
module.exports = { inviteUser };
```
*   This exposes the `inviteUser` function so it can be imported and used by the routes that need it.
