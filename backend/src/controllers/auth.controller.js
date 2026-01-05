const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { users } = require("../db/inMemory");

function safeUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "identifier and password required" });
    }

    const user = users.find(
      (u) => u.username === identifier || u.email === identifier
    );

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { login };
