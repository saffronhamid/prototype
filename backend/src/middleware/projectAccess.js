const { projectMembers } = require("../db/inMemory");

// require that user is a member of project (optionally with certain project roles)
function requireProjectRole(...allowedProjectRoles) {
  return (req, res, next) => {
    const projectId = req.params.id;
    const userId = req.user?.id;

    const membership = projectMembers.find(
      (m) => m.projectId === projectId && m.userId === userId
    );

    if (!membership) {
      return res.status(403).json({ message: "Not a member of this project" });
    }

    if (allowedProjectRoles.length > 0 && !allowedProjectRoles.includes(membership.projectRole)) {
      return res.status(403).json({ message: "Insufficient project role" });
    }

    // attach for later use
    req.projectMembership = membership;
    return next();
  };
}

module.exports = { requireProjectRole };
