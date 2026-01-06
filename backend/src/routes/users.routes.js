const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/auth");
const { users } = require("../db/inMemory");
const { inviteUser } = require("../controllers/invitations.controller");
// POST /users/invite  ✅ YAML
function safeUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}
// POST /users/invite  ✅ YAML (ADMIN only)
router.post("/invite", requireAuth, requireRole("ADMIN"), inviteUser);

// GET /users/me  ✅ YAML
router.get("/me", requireAuth, (req, res) => {
  const me = users.find((u) => u.id === req.user.id);
  if (!me) return res.status(404).json({ message: "User not found" });
  return res.json(safeUser(me));
});

// GET /users?search=...  ✅ YAML (Admin-only)
router.get("/", requireAuth, requireRole("ADMIN"), (req, res) => {
  const search = (req.query.search || "").toString().trim().toLowerCase();

  let result = users.map(safeUser);

  if (search) {
    result = result.filter(
      (u) =>
        (u.username || "").toLowerCase().includes(search) ||
        (u.email || "").toLowerCase().includes(search)
    );
  }

  return res.json(result);
});

module.exports = router;
