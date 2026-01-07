const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/auth");
const { users } = require("../db/inMemory");

// POST /users/:user_id/anonymize ✅ YAML (ADMIN only)
router.post("/:user_id/anonymize", requireAuth, requireRole("ADMIN"), (req, res) => {
  const u = users.find((x) => x.id === req.params.user_id);
  if (!u) return res.status(404).json({ message: "User not found" });

  // Prototype anonymization
  u.username = `anonymized_${u.id}`;
  u.email = `anonymized_${u.id}@example.com`;
  u.firstName = "Anonymized";
  u.lastName = "User";

  return res.json({ message: "User anonymized" });
});

module.exports = router;
