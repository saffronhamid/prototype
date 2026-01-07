/**
 * Main application entry point.
 * Configures Express, middleware, and routes.
 * Starts the server.
 */
console.log("SERVER FILE LOADED");
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const projectsRoutes = require("./routes/projects.routes"); 
const usersRoutes = require("./routes/users.routes");
const profileRoutes = require("./routes/profile.routes");
const usersMeRoutes = require("./routes/users.me.routes");
const updateProfileRoutes = require("./routes/updateProfile.routes");
const changePasswordRoutes = require("./routes/changePassword.routes");
const usersByIdRoutes = require("./routes/users.byId.routes");
const usersAnonymizeRoutes = require("./routes/users.anonymize.routes");
const appointmentsRoutes = require("./routes/appointments.routes");

const app = express();
app.use(cors());
app.use(express.json({ type: ["application/json", "application/merge-patch+json"] }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/projects", projectsRoutes); // ✅ ADD THIS
app.use("/users", usersRoutes);
app.use("/profile", profileRoutes);
app.use("/profile/change-password", changePasswordRoutes);
app.use("/users/me", usersMeRoutes);
app.use("/update-profile", updateProfileRoutes);
app.use("/users", usersByIdRoutes);       // /users/:user_id
app.use("/users", usersAnonymizeRoutes);  // /users/:user_id/anonymize
app.use("/projects", appointmentsRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
