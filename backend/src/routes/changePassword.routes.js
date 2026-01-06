const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const { requireAuth } = require("../middleware/auth");
const { users } = require("../db/inMemory");

// POST /profile/change-password ✅ YAML
// body: { currentPassword, newPassword }
// response: 204 No Content
router.post("/", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "currentPassword and newPassword are required" });
  }

  const me = users.find((u) => u.id === req.user.id);
  if (!me) return res.status(404).json({ message: "User not found" });

  const ok = await bcrypt.compare(currentPassword, me.passwordHash);
  if (!ok) return res.status(400).json({ message: "currentPassword is incorrect" });

  me.passwordHash = await bcrypt.hash(newPassword, 10);

  // ✅ YAML-style
  return res.status(204).send();
});

module.exports = router;
