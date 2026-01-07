const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { projects, projectMembers, appointments } = require("../db/inMemory");

function canAccessProject(req, projectId) {
  if (req.user.role === "ADMIN") return true;
  return projectMembers.some((m) => m.projectId === projectId && m.userId === req.user.id);
}

function ensureProjectExists(projectId) {
  return projects.some((p) => p.id === projectId);
}

// GET /projects/:projectId/appointment
// returns all appointments for a project
router.get("/:projectId/appointment", requireAuth, (req, res) => {
  const { projectId } = req.params;

  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });

  return res.json(appointments.filter((a) => a.projectId === projectId));
});

// GET /projects/:projectId/appointment/overview
// basic counts + upcoming list
router.get("/:projectId/appointment/overview", requireAuth, (req, res) => {
  const { projectId } = req.params;

  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });

  const list = appointments.filter((a) => a.projectId === projectId);

  const now = Date.now();
  const upcoming = list
    .filter((a) => Date.parse(a.startAt) >= now)
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
    .slice(0, 5);

  return res.json({
    projectId,
    total: list.length,
    upcomingCount: upcoming.length,
    upcoming,
  });
});

// POST /projects/:projectId/appointment/create
router.post("/:projectId/appointment/create", requireAuth, (req, res) => {
  const { projectId } = req.params;

  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });

  const { title, startAt, endAt, location = "", notes = "" } = req.body || {};

  if (!title || typeof title !== "string") {
    return res.status(400).json({ message: "title is required" });
  }
  if (!startAt || !endAt) {
    return res.status(400).json({ message: "startAt and endAt are required" });
  }

  const startMs = Date.parse(startAt);
  const endMs = Date.parse(endAt);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return res.status(400).json({ message: "startAt/endAt must be valid ISO date strings" });
  }
  if (endMs <= startMs) {
    return res.status(400).json({ message: "endAt must be after startAt" });
  }

  const id = `apt_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date().toISOString();

  const appt = {
    id,
    projectId,
    title: title.trim(),
    startAt,
    endAt,
    location,
    notes,
    createdBy: req.user.id,
    createdAt: now,
    updatedAt: now,
  };

  appointments.push(appt);
  return res.status(201).json(appt);
});

// POST /projects/:projectId/appointment/update
// body: { id, ...patchFields }
router.post("/:projectId/appointment/update", requireAuth, (req, res) => {
  const { projectId } = req.params;

  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });

  const { id, title, startAt, endAt, location, notes } = req.body || {};
  if (!id) return res.status(400).json({ message: "id is required" });

  const appt = appointments.find((a) => a.id === id && a.projectId === projectId);
  if (!appt) return res.status(404).json({ message: "Appointment not found" });

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) return res.status(400).json({ message: "title must be a non-empty string" });
    appt.title = title.trim();
  }

  if (startAt !== undefined) {
    const ms = Date.parse(startAt);
    if (Number.isNaN(ms)) return res.status(400).json({ message: "startAt must be a valid ISO date string" });
    appt.startAt = startAt;
  }

  if (endAt !== undefined) {
    const ms = Date.parse(endAt);
    if (Number.isNaN(ms)) return res.status(400).json({ message: "endAt must be a valid ISO date string" });
    appt.endAt = endAt;
  }

  // Validate time order if either changed
  const s = Date.parse(appt.startAt);
  const e = Date.parse(appt.endAt);
  if (e <= s) return res.status(400).json({ message: "endAt must be after startAt" });

  if (location !== undefined) appt.location = location;
  if (notes !== undefined) appt.notes = notes;

  appt.updatedAt = new Date().toISOString();

  return res.json(appt);
});

// POST /projects/:projectId/appointment/delete
// body: { id }
router.post("/:projectId/appointment/delete", requireAuth, (req, res) => {
  const { projectId } = req.params;

  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });

  const { id } = req.body || {};
  if (!id) return res.status(400).json({ message: "id is required" });

  const idx = appointments.findIndex((a) => a.id === id && a.projectId === projectId);
  if (idx === -1) return res.status(404).json({ message: "Appointment not found" });

  appointments.splice(idx, 1);
  return res.status(204).send();
});

// GET /projects/:projectId/appointment/search?query=...
router.get("/:projectId/appointment/search", requireAuth, (req, res) => {
  const { projectId } = req.params;
  const q = String(req.query.query || "").trim().toLowerCase();

  if (!ensureProjectExists(projectId)) return res.status(404).json({ message: "Project not found" });
  if (!canAccessProject(req, projectId)) return res.status(403).json({ message: "Forbidden" });
  if (!q) return res.status(400).json({ message: "query is required" });

  const results = appointments
    .filter((a) => a.projectId === projectId)
    .filter((a) => {
      const hay = `${a.title} ${a.location || ""} ${a.notes || ""}`.toLowerCase();
      return hay.includes(q);
    });

  return res.json(results);
});

module.exports = router;
