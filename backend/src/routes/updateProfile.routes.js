const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { users } = require("../db/inMemory");

function safeUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// PATCH /update-profile ✅ YAML
// Content-Type: application/merge-patch+json
// supports patching: username, firstName, lastName
router.patch("/", requireAuth, (req, res) => {
  const me = users.find((u) => u.id === req.user.id);
  if (!me) return res.status(404).json({ message: "User not found" });

  const patch = req.body || {};

  if (patch.username !== undefined) {
    if (typeof patch.username !== "string" || !patch.username.trim()) {
      return res.status(400).json({ message: "username must be a non-empty string" });
    }
    const newUsername = patch.username.trim();
    const taken = users.some((u) => u.username === newUsername && u.id !== me.id);
    if (taken) return res.status(400).json({ message: "username already taken" });
    me.username = newUsername;
  }

  if (patch.firstName !== undefined) {
    if (typeof patch.firstName !== "string") {
      return res.status(400).json({ message: "firstName must be a string" });
    }
    me.firstName = patch.firstName;
  }

  if (patch.lastName !== undefined) {
    if (typeof patch.lastName !== "string") {
      return res.status(400).json({ message: "lastName must be a string" });
    }
    me.lastName = patch.lastName;
  }

  return res.json(safeUser(me));
});

module.exports = router;
