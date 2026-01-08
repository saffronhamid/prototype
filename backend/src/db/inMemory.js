const bcrypt = require("bcrypt");

// ---------------- SETTINGS ----------------
const connectionMonitorSettings = {
  enabled: true,
  intervalSeconds: 60,
  notifyOnDisconnect: true,
};

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

// ---------------- PROJECT MEMBERS ----------------
const projectMembers = [
  { projectId: "p1", userId: "u2", projectRole: "DEVELOPER" }, // dev user in p1
  { projectId: "p2", userId: "u2", projectRole: "MANAGER" },   // dev user manager in p2
];

// ---------------- INVITATIONS ----------------
const invitations = [];

// ---------------- APPOINTMENTS ----------------
const appointments = [];

// ---------------- COMMENTS ----------------
const comments = [];

// This must be at the end of the file
module.exports = {
  users,
  projects,
  projectMembers,
  invitations,
  appointments,
  comments,
  connectionMonitorSettings,
};
