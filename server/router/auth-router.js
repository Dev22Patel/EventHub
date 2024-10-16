const express = require("express");
const router = express.Router();
const { home, register, login } = require("../controllers/auth-controller");
const authenticateToken = require("../middlewares/authentication");

// Public routes
router.route("/").get(home);
router.route("/register").post(register);
router.route("/login").post(login);



module.exports = router;
