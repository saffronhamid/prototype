const { invitations, projects } = require("../db/inMemory");

function makeId() {
  return `inv-${Math.random().toString(36).slice(2, 10)}`;
}

// POST /users/invite  ✅ YAML
// body: { email, role: "admin"|"end_user", projectId?: string|null }
// response 201: { message, invitationId }
async function inviteUser(req, res) {
  const { email, role, projectId = null } = req.body || {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "email is required" });
  }
  const emailNorm = email.trim().toLowerCase();
  const allowedRoles = ["admin", "end_user"];
  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({ message: "role must be 'admin' or 'end_user'" });
  }

  if (projectId != null) {
    const exists = projects.some((p) => p.id === projectId);
    if (!exists) return res.status(400).json({ message: "projectId does not exist" });
  }

  const invitationId = makeId();

  invitations.push({
    id: invitationId,
    email: emailNorm,
    role,                 // YAML role string
    projectId: projectId ?? null,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    acceptedAt: null,
  });

  // Prototype: we do NOT actually send email. We return the invitationId like YAML.
  return res.status(201).json({
    message: "Invitation email sent",
    invitationId,
  });
}

module.exports = { inviteUser };
