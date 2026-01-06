const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { users } = require("../db/inMemory");

function safeUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// GET /profile  ✅ YAML
router.get("/", requireAuth, (req, res) => {
  const me = users.find((u) => u.id === req.user.id);
  if (!me) return res.status(404).json({ message: "User not found" });
  return res.json(safeUser(me));
});

module.exports = router;
