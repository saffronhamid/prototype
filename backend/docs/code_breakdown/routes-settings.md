# Code Breakdown: `src/routes/settings.routes.js`

This file defines the API endpoints for managing global **Application Settings**.

---

## 1. File Purpose & High-Level View

The purpose of this file is to provide a secure way for administrators to read and update application-wide settings. In this case, it manages the `connectionMonitorSettings` object from the in-memory database.

It is mounted at the `/settings` path in `server.js`.

---

## 2. Connections to Other Files

*   **`src/server.js` (Parent)**: Imports this router and mounts it at `/settings`.
*   **`../middleware/auth.js` (Security)**: Imports `requireAuth` and `requireRole` to ensure all endpoints are accessible only by authenticated `ADMIN` users.
*   **`../db/inMemory.js` (Database)**: Imports the `connectionMonitorSettings` object to read and modify it.

---

## 3. Code Breakdown & OpenAPI Connections

### `GET /settings/connection-monitor`
*   **Explanation**: An `ADMIN`-only endpoint that returns the current `connectionMonitorSettings` object.
*   **OpenAPI Connection**:
    *   **Path**: `paths./settings/connection-monitor.get`
    *   **Implementation**: This route directly implements the "get settings" feature, secured by `requireRole("ADMIN")`. The response matches the `ConnectionMonitorSettings` schema.

### `PATCH /settings/connection-monitor`
*   **Explanation**: An `ADMIN`-only endpoint for partially updating the settings. A user can send a request with just one key (e.g., `{ "enabled": false }`) to change only that value. It includes validation for each field.
*   **OpenAPI Connection**:
    *   This specific `PATCH` method is not in the YAML, which uses `PUT`. `PATCH` is more suitable for partial updates.

### `PUT /settings/connection-monitor`
*   **Explanation**: An `ADMIN`-only endpoint that updates the entire settings object at once. It requires all fields (`enabled`, `intervalSeconds`, `notifyOnDisconnect`) to be present in the request body.
*   **OpenAPI Connection**:
    *   **Path**: `paths./settings/connection-monitor.put`
    *   **Implementation**: This route implements the "update settings" feature. The `requestBody` validation checks for all fields defined in the `ConnectionMonitorSettingsUpdate` schema. The `200` response returns the newly updated settings object.

---

### Module Export
```javascript
module.exports = router;
```
*   Exports the router for use in `server.js`.
