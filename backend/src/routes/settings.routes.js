const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/auth");
const { connectionMonitorSettings } = require("../db/inMemory");

// GET /settings/connection-monitor
router.get("/connection-monitor", requireAuth, requireRole("ADMIN"), (req, res) => {
  return res.json(connectionMonitorSettings);
});

// PATCH /settings/connection-monitor (merge patch)
router.patch("/connection-monitor", requireAuth, requireRole("ADMIN"), (req, res) => {
  const patch = req.body || {};

  if (patch.enabled !== undefined) {
    if (typeof patch.enabled !== "boolean") {
      return res.status(400).json({ message: "enabled must be boolean" });
    }
    connectionMonitorSettings.enabled = patch.enabled;
  }

  if (patch.intervalSeconds !== undefined) {
    const n = Number(patch.intervalSeconds);
    if (!Number.isFinite(n) || n <= 0) {
      return res.status(400).json({ message: "intervalSeconds must be a positive number" });
    }
    connectionMonitorSettings.intervalSeconds = n;
  }

  if (patch.notifyOnDisconnect !== undefined) {
    if (typeof patch.notifyOnDisconnect !== "boolean") {
      return res.status(400).json({ message: "notifyOnDisconnect must be boolean" });
    }
    connectionMonitorSettings.notifyOnDisconnect = patch.notifyOnDisconnect;
  }

  return res.json(connectionMonitorSettings);
});

// OPTIONAL: if your OpenAPI uses PUT instead of PATCH, keep this too
router.put("/connection-monitor", requireAuth, requireRole("ADMIN"), (req, res) => {
  const { enabled, intervalSeconds, notifyOnDisconnect } = req.body || {};

  if (typeof enabled !== "boolean") return res.status(400).json({ message: "enabled must be boolean" });

  const n = Number(intervalSeconds);
  if (!Number.isFinite(n) || n <= 0) return res.status(400).json({ message: "intervalSeconds must be a positive number" });

  if (typeof notifyOnDisconnect !== "boolean") return res.status(400).json({ message: "notifyOnDisconnect must be boolean" });

  connectionMonitorSettings.enabled = enabled;
  connectionMonitorSettings.intervalSeconds = n;
  connectionMonitorSettings.notifyOnDisconnect = notifyOnDisconnect;

  return res.json(connectionMonitorSettings);
});

module.exports = router;
