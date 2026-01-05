console.log("SERVER FILE LOADED");
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const projectsRoutes = require("./routes/projects.routes"); // ✅ ADD THIS

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/projects", projectsRoutes); // ✅ ADD THIS

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
