const { json } = require("express");
const User = require("../models/user-model");

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password") 
            .populate('events') 
            .populate('participatedAuctions'); 

        const usersData = users.map(user => user.toObject());

        console.log("Data fetched successfully", usersData);
        res.status(200).json(usersData);
    } catch (error) {
        console.log("Error fetching users:", error.message);
        res.status(500).json({ error: error.message });
    }
};


exports.deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};
