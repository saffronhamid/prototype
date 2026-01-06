const express = require("express");
const router = express.Router();
const { acceptInvitation } = require("../controllers/acceptInvitation.controller");
const { login } = require("../controllers/auth.controller");

router.post("/login", login);
router.post("/accept-invitation", acceptInvitation);
module.exports = router;
