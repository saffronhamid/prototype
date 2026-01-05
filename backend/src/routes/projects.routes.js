const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/auth");
const { projects, projectMembers } = require("../db/inMemory");

// -------------------------------
// GET /projects  (ADMIN only) ✅ YAML
// -------------------------------
router.get("/", requireAuth, requireRole("ADMIN"), (req, res) => {
  return res.json(projects);
});

// -------------------------------
// GET /projects/mine  ✅ YAML
// NOTE: must be BEFORE "/:id"
// -------------------------------
router.get("/mine", requireAuth, (req, res) => {
  const myProjectIds = new Set(
    projectMembers
      .filter((m) => m.userId === req.user.id)
      .map((m) => m.projectId)
  );

  const myProjects = projects.filter((p) => myProjectIds.has(p.id));
  return res.json(myProjects);
});

// -------------------------------
// GET /projects/:id (ADMIN or member)
// -------------------------------
router.get("/:id", requireAuth, (req, res) => {
  const project = projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  if (req.user.role === "ADMIN") return res.json(project);

  const isMember = projectMembers.some(
    (m) => m.projectId === req.params.id && m.userId === req.user.id
  );
  if (!isMember) return res.status(403).json({ message: "Forbidden" });

  return res.json(project);
});

// -------------------------------
// POST /projects (ADMIN only)
// -------------------------------
router.post("/", requireAuth, requireRole("ADMIN"), (req, res) => {
  const { name, description = "", status = "ACTIVE", type = "INTERNAL" } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "name is required" });
  }

  const newProject = {
    id: `p${projects.length + 1}`,
    name: name.trim(),
    description,
    status,
    type,
  };

  projects.push(newProject);
  return res.status(201).json(newProject);
});

// -------------------------------
// POST /projects/:id/members (ADMIN only)
// body: { userId: "u2", projectRole: "DEVELOPER" | "MANAGER" }
// -------------------------------
router.post("/:id/members", requireAuth, requireRole("ADMIN"), (req, res) => {
  const project = projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const { userId, projectRole } = req.body;
  if (!userId || !projectRole) {
    return res.status(400).json({ message: "userId and projectRole are required" });
  }

  const allowed = ["DEVELOPER", "MANAGER"];
  if (!allowed.includes(projectRole)) {
    return res.status(400).json({ message: "projectRole must be DEVELOPER or MANAGER" });
  }

  const existing = projectMembers.find(
    (m) => m.projectId === req.params.id && m.userId === userId
  );

  if (existing) {
    existing.projectRole = projectRole;
    return res.json({ message: "Updated membership", membership: existing });
  }

  const membership = { projectId: req.params.id, userId, projectRole };
  projectMembers.push(membership);
  return res.status(201).json({ message: "Added membership", membership });
});

module.exports = router;
