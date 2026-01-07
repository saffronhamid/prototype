# The Complete Blueprint: Backend Architecture Explained

This document provides a **comprehensive, deep-dive explanation** of the entire codebase. It bridges the gap between high-level concepts and the specific lines of code running on the server. It is designed to explain *everything* in detail.

---

## Part 1: The Conceptual Model (The "Why")

Before looking at files, we must understand the *pattern* this project follows. It uses the **MVC (Model-View-Controller)** pattern, adapted for an API.

*   **The Problem:** If you put all code in one file, it becomes a "Spaghetti Code" mess. You can't find anything, and changing one thing breaks another.
*   **The Solution:** We separate the code based on **responsibility**.
    1.  **Entry Point (`server.js`)**: The receptionist.
    2.  **Routes (`src/routes`)**: The menu/directions.
    3.  **Middleware (`src/middleware`)**: The security guards.
    4.  **Controllers (`src/controllers`)**: The workers who actually do the job.
    5.  **Database (`src/db`)**: The filing cabinet.

---

## Part 2: The Microscope View (File-by-File Deep Dive)

### 1. The Brain: `src/server.js`
This is the **Entry Point**. When you run `npm run dev`, this is the *only* file Node.js actually executes directly. Everything else is loaded by this file.

*   **What happens here?**
    *   **Loading Libraries**: It grabs `express` (the web framework), `cors` (security settings for browsers), and `dotenv` (to read passwords from `.env`).
    *   **Configuration (`app.use`)**: It tells the app *how* to behave.
        *   `express.json()`: **CRITICAL**. By default, servers don't know how to read JSON data sent by a user. This line is a "translator" that converts raw text into a JavaScript object we can use (`req.body`).
    *   **Routing Board**: It maps URLs to files.
        *   `app.use("/auth", authRoutes)` means: "If a user goes to `http://website.com/auth/...`, stop handling it here and pass the request to the `authRoutes` file."
    *   **The Listener**: `app.listen(port)` is the final line. It opens the "digital door" and waits for connections.

### 2. The Immune System: `src/middleware/`
Middleware are functions that run *in the middle* of a request—after the server receives it, but *before* the Controller handles it.

#### `auth.js` (The Bouncer)
*   **`requireAuth`**:
    *   **The logic:** It looks at the request header: `Authorization: Bearer <token>`.
    *   **The detailed check:** It takes that `<token>` and uses a secret key (`JWT_SECRET` from `.env`) to "unlock" it.
    *   **Success:** If the key fits, it extracts the user's ID inside the token and attaches it to `req.user`. Now the rest of the app knows *exactly* who this is.
    *   **Failure:** If the token is fake or expired, it immediately kicks the user out (`401 Unauthorized`). The Controller never even runs.
*   **`requireRole`**:
    *   Even if you are logged in, are you an `ADMIN`? This checks the `role` inside the user object. If you are just a `USER` trying to delete the database, this guard stops you (`403 Forbidden`).

#### `projectAccess.js` (The VIP List)
*   **The problem:** You are logged in, and you are valid. But are you allowed to see *Project X*?
*   **The solution:** It checks the `projectMembers` list in the database.
    *   It asks: "Is `User A` listed as a member of `Project B`?"
    *   If no, it blocks access. This prevents users from spying on projects they don't belong to.

### 3. The Nervous System: `src/routes/`
Routes are traffic directors. They don't do the "heavy lifting" (logic); they just define **endpoints**.

*   **Why so many files?**
    *   `auth.routes.js`: Only for Login/Register.
    *   `projects.routes.js`: Only for Project stuff.
    *   `users.routes.js`: Only for listing users.
    *   **The "Splitting" Strategy**: You'll notice files like `users.anonymize.routes.js` or `users.byId.routes.js`. We split them because the "User" feature became too big. By keeping "Anonymization" separate from "Profile Update", two developers can work on "Users" at the same time without conflicting.

### 4. The Muscles: `src/controllers/`
This is where the **Business Logic** lives. This is the code that actually *thinks*.

#### `auth.controller.js`
*   **The `login` function:**
    1.  **Input:** Takes `email` and `password`.
    2.  **Validation:** Checks if they are empty.
    3.  **Search:** Looks for the user in the "Database".
    4.  **Security Check:** Uses `bcrypt.compare()`. It doesn't compare plain text passwords (that's dangerous). It hashes the input and sees if it matches the stored hash.
    5.  **Token Issuance:** If valid, it signs a new JWT (JSON Web Token). This token is the "Ticket" the user will use for the next hour.

### 5. The Memory: `src/db/inMemory.js`
*   **What is it?** A JavaScript file exporting arrays (`[]`).
*   **Why not a real DB?** For a prototype, setting up a database server (Postgres/MongoDB) takes time and resources. Using arrays is instant and lets us prove the *logic* works.
*   **The Data Structure:**
    *   `users`: The list of people.
    *   `projects`: The list of work items.
    *   `projectMembers`: The **Connector**.
        *   It looks like: `{ projectId: "p1", userId: "u1", role: "MANAGER" }`.
        *   This is called a **Many-to-Many Relationship**. One user can be in many projects; one project can have many users. This table links them.

---

## Part 3: The "Life of a Request" (Step-by-Step Animation)

Let's trace exactly what happens when a user clicks "View Project" on the frontend.

**Scenario:** User `Alice` (ID: `u2`) wants to view `Project 1`.

1.  **The Click:**
    *   Alice's browser sends a request: `GET /projects/p1`
    *   It includes headers: `Authorization: Bearer <Alice's Token>`

2.  **Entry (`server.js`)**:
    *   Server sees the URL starts with `/projects`.
    *   It passes the request to `projects.routes.js`.

3.  **Route Match (`projects.routes.js`)**:
    *   The router finds the matching line: `router.get("/:id", ...)`

4.  **Middleware Check (`middleware/auth.js`)**:
    *   `requireAuth` runs first.
    *   It validates Alice's token. "Yes, this is Alice."
    *   It adds `req.user = { id: "u2", ... }` to the request object.

5.  **Middleware Check (`middleware/projectAccess.js`)**:
    *   (If configured) It checks: "Is `u2` a member of `p1`?"
    *   It looks in `src/db/inMemory.js`.
    *   Result: "Yes, she is a DEVELOPER."

6.  **The Logic**:
    *   The code inside the route runs:
        ```javascript
        const project = projects.find((p) => p.id === "p1");
        return res.json(project);
        ```
    *   It grabs the project data from the array.

7.  **The Response**:
    *   The server sends the JSON data back to Alice's browser.
    *   Browser displays the project page.

---

## Part 4: Key Technical Concepts Explained

*   **`req` (Request)**: An object containing everything the user sent us (URL parameters, body data, headers).
*   **`res` (Response)**: An object with tools to send data back. `res.json(...)` sends data; `res.status(404)` sends an error code.
*   **`async / await`**: Used in controllers. It tells JavaScript "Pause here and wait for the password check to finish before moving to the next line." It prevents the code from running out of order.
*   **`module.exports`**: The Node.js way of sharing code. If `fileA.js` says `module.exports = { x }`, then `fileB.js` can say `require('./fileA')` to use `x`. This is how we connect all these files together.