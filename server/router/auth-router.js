const express = require("express");
const router = express.Router();
const { home, register, login, getUserData } = require("../controllers/auth-controller");
const authenticateToken = require("../middlewares/authentication");
const rt=require("../controllers/auth-controller");
// Public routes
router.route("/").get(home);
router.route("/register").post(register);
router.route("/login").post(login);
router.get("/user/:userId",rt.getUserData);

module.exports = router;
