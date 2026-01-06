const bcrypt = require("bcrypt");
const { invitations, users, projectMembers } = require("../db/inMemory");

function mapRole(yamlRole) {
  // YAML: "admin" | "end_user"
  return yamlRole === "admin" ? "ADMIN" : "END_USER";
}

async function acceptInvitation(req, res) {
  const { invitationId, username, password, firstName, lastName } = req.body || {};

  if (!invitationId || !username || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "invitationId, username, password, firstName, lastName are required" });
  }

  const inv = invitations.find((i) => i.id === invitationId);
  if (!inv) return res.status(404).json({ message: "Invitation not found" });
  if (inv.status !== "PENDING") {
    return res.status(400).json({ message: "Invitation already used or invalid" });
  }

  // uniqueness checks (prototype)
  const usernameTaken = users.some((u) => u.username === username);
  if (usernameTaken) return res.status(400).json({ message: "username already taken" });

  const emailTaken = users.some((u) => u.email === inv.email);
  if (emailTaken) return res.status(400).json({ message: "email already registered" });

  const newUserId = `u${users.length + 1}`;

  const newUser = {
    id: newUserId,
    username,
    email: inv.email,
    role: mapRole(inv.role),
    firstName,
    lastName,
    passwordHash: await bcrypt.hash(password, 10),
  };

  users.push(newUser);

  // If invited to a project, add membership (default DEVELOPER for end_user)
  if (inv.projectId) {
    projectMembers.push({
      projectId: inv.projectId,
      userId: newUserId,
      projectRole: newUser.role === "ADMIN" ? "MANAGER" : "DEVELOPER",
    });
  }

  inv.status = "ACCEPTED";
  inv.acceptedAt = new Date().toISOString();

  return res.status(201).json({
    message: "Account successfully created",
    userId: newUserId,
  });
}

module.exports = { acceptInvitation };
