const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { projects, projectMembers, comments } = require("../db/inMemory");

function canAccessProject(req, projectId) {
  if (req.user.role === "ADMIN") return true;
  return projectMembers.some((m) => m.projectId === projectId && m.userId === req.user.id);
}

function ensureProjectExists(projectId) {
  return projects.some((p) => p.id === projectId);
}

// GET /projects/:projectId/comments
router.get("/:projectId/comments", requireAuth, (req, res) => {
  const { projectId } = req.params;
  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });

  const list = comments
    .filter((c) => c.projectId === projectId)
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

  return res.json(list);
});

// GET /projects/:projectId/comments/search?query=...
router.get("/:projectId/comments/search", requireAuth, (req, res) => {
  const { projectId } = req.params;
  const q = String(req.query.query || "").trim().toLowerCase();

  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });
  if (!q) return res.status(400).json({ message: "query is required" });

  const results = comments
    .filter((c) => c.projectId === projectId)
    .filter((c) => (c.text || "").toLowerCase().includes(q));

  return res.json(results);
});

// POST /projects/:projectId/comments  (create)
router.post("/:projectId/comments", requireAuth, (req, res) => {
  const { projectId } = req.params;
  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });

  const { text } = req.body || {};
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ message: "text is required" });
  }

  const id = `cmt_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();

  const c = {
    id,
    projectId,
    text: text.trim(),
    createdBy: req.user.id,
    createdAt: now,
    updatedAt: now,
  };

  comments.push(c);
  return res.status(201).json(c);
});

// GET /projects/:projectId/comments/:commentId
router.get("/:projectId/comments/:commentId", requireAuth, (req, res) => {
  const { projectId, commentId } = req.params;
  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });

  const c = comments.find((x) => x.projectId === projectId && x.id === commentId);
  if (!c) return res.status(404).json({ message: "Comment not found" });

  return res.json(c);
});

// PATCH /projects/:projectId/comments/:commentId
// allow author or admin
router.patch("/:projectId/comments/:commentId", requireAuth, (req, res) => {
  const { projectId, commentId } = req.params;
  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });

  const c = comments.find((x) => x.projectId === projectId && x.id === commentId);
  if (!c) return res.status(404).json({ message: "Comment not found" });

  // only author can edit unless admin
  if (req.user.role !== "ADMIN" && c.createdBy !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ message: "text is required" });
  }

  c.text = text.trim();
  c.updatedAt = new Date().toISOString();

  return res.json(c);
});

// DELETE /projects/:projectId/comments/:commentId
// allow author or admin
router.delete("/:projectId/comments/:commentId", requireAuth, (req, res) => {
  const { projectId, commentId } = req.params;
  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });

  const idx = comments.findIndex((x) => x.projectId === projectId && x.id === commentId);
  if (idx === -1) return res.status(404).json({ message: "Comment not found" });

  const c = comments[idx];

  // only author can delete unless admin
  if (req.user.role !== "ADMIN" && c.createdBy !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  comments.splice(idx, 1);
  return res.status(204).send();
});

module.exports = router;
