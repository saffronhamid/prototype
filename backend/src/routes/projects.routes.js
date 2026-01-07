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
// GET /projects/mine ✅ YAML
router.get("/mine", requireAuth, (req, res) => {
  // For this prototype:
  // - END_USER: return only projects where user is a member
  // - ADMIN: return all projects (easy for testing)
  if (req.user.role === "ADMIN") {
    return res.json(projects);
  }

  const myProjectIds = new Set(
    projectMembers
      .filter((m) => m.userId === req.user.id)
      .map((m) => m.projectId)
  );

  const myProjects = projects.filter((p) => myProjectIds.has(p.id));
  return res.json(myProjects);
});

// GET /projects/search?query=... ✅ YAML
router.get("/search", requireAuth, (req, res) => {
  const q = String(req.query.query || "").trim().toLowerCase();
  if (!q) return res.status(400).json({ message: "query is required" });

  // Determine accessible projects
  let accessible = projects;

  if (req.user.role !== "ADMIN") {
    const myProjectIds = new Set(
      projectMembers
        .filter((m) => m.userId === req.user.id)
        .map((m) => m.projectId)
    );
    accessible = projects.filter((p) => myProjectIds.has(p.id));
  }

  const results = accessible.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    return name.includes(q) || desc.includes(q);
  });

  return res.json(results);
});
// GET /projects/:projectId/analysis ✅ YAML
router.get("/:projectId/analysis", requireAuth, (req, res) => {
  const project = projects.find((p) => p.id === req.params.projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });

  // ADMIN can access all
  if (req.user.role === "ADMIN") {
    return res.json({
      projectId: project.id,
      summary: "Prototype analysis",
      metrics: {
        members: projectMembers.filter((m) => m.projectId === project.id).length,
        status: project.status,
        type: project.type,
      },
      generatedAt: new Date().toISOString(),
    });
  }

  // End users: must be a member
  const isMember = projectMembers.some(
    (m) => m.projectId === project.id && m.userId === req.user.id
  );
  if (!isMember) return res.status(403).json({ message: "Forbidden" });

  return res.json({
    projectId: project.id,
    summary: "Prototype analysis",
    metrics: {
      members: projectMembers.filter((m) => m.projectId === project.id).length,
      status: project.status,
      type: project.type,
    },
    generatedAt: new Date().toISOString(),
  });
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
