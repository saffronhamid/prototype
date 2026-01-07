const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/auth");
const { users, projectMembers } = require("../db/inMemory");

function safeUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// ✅ ADMIN-only for user management endpoints
router.use(requireAuth, requireRole("ADMIN"));

// GET /users/:user_id
router.get("/:user_id", (req, res) => {
  const u = users.find((x) => x.id === req.params.user_id);
  if (!u) return res.status(404).json({ message: "User not found" });
  return res.json(safeUser(u));
});

// PATCH /users/:user_id (Admin edits user)
// Supports: username, firstName, lastName, role
router.patch("/:user_id", (req, res) => {
  const u = users.find((x) => x.id === req.params.user_id);
  if (!u) return res.status(404).json({ message: "User not found" });

  const patch = req.body || {};

  if (patch.username !== undefined) {
    if (typeof patch.username !== "string" || !patch.username.trim()) {
      return res.status(400).json({ message: "username must be a non-empty string" });
    }
    const newUsername = patch.username.trim();
    const taken = users.some((x) => x.username === newUsername && x.id !== u.id);
    if (taken) return res.status(400).json({ message: "username already taken" });
    u.username = newUsername;
  }

  if (patch.firstName !== undefined) {
    if (typeof patch.firstName !== "string") {
      return res.status(400).json({ message: "firstName must be a string" });
    }
    u.firstName = patch.firstName;
  }

  if (patch.lastName !== undefined) {
    if (typeof patch.lastName !== "string") {
      return res.status(400).json({ message: "lastName must be a string" });
    }
    u.lastName = patch.lastName;
  }

  if (patch.role !== undefined) {
    const allowed = ["ADMIN", "END_USER"];
    if (!allowed.includes(patch.role)) {
      return res.status(400).json({ message: "role must be ADMIN or END_USER" });
    }
    u.role = patch.role;
  }

  return res.json(safeUser(u));
});

// DELETE /users/:user_id
router.delete("/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const idx = users.findIndex((x) => x.id === userId);
  if (idx === -1) return res.status(404).json({ message: "User not found" });

  // prevent deleting yourself (optional but sensible)
  if (req.user.id === userId) {
    return res.status(400).json({ message: "Cannot delete yourself" });
  }

  // remove memberships too (clean prototype behavior)
  for (let i = projectMembers.length - 1; i >= 0; i--) {
    if (projectMembers[i].userId === userId) projectMembers.splice(i, 1);
  }

  users.splice(idx, 1);
  return res.status(204).send();
});

module.exports = router;
