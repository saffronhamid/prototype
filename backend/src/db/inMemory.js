const bcrypt = require("bcrypt");

// ---------------- USERS ----------------
// prototype users (password = "Test1234!")
const users = [
  {
    id: "u1",
    username: "admin",
    email: "admin@example.com",
    role: "ADMIN",
    firstName: "Admin",
    lastName: "User",
    passwordHash: bcrypt.hashSync("Test1234!", 10),
  },
  {
    id: "u2",
    username: "dev",
    email: "dev@example.com",
    role: "END_USER",
    firstName: "Dev",
    lastName: "User",
    passwordHash: bcrypt.hashSync("Test1234!", 10),
  },
];

// ---------------- PROJECTS ----------------
const projects = [
  {
    id: "p1",
    name: "Smart-Rent",
    description: "Prototype rental platform",
    status: "ACTIVE",
    type: "INTERNAL",
  },
  {
    id: "p2",
    name: "Bat Tracking",
    description: "CV pipeline prototype",
    status: "ACTIVE",
    type: "RESEARCH",
  },
];

// who belongs to which project + role in project
const projectMembers = [
  { projectId: "p1", userId: "u2", projectRole: "DEVELOPER" }, // dev user in p1
  { projectId: "p2", userId: "u2", projectRole: "MANAGER" },   // dev user manager in p2
];

module.exports = { users, projects, projectMembers };
