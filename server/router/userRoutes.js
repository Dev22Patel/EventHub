const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Route to get all users
router.get("/", userController.getAllUsers);

// Route to delete a user by ID
router.delete("/:id", userController.deleteUserById);

module.exports = router;
