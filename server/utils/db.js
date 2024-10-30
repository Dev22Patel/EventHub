const mongoose = require("mongoose");
require("dotenv").config();
const URI = process.env.DATABASE_URL;
// mongoose.connect(URI);

const connectDb = async () => {
  try {
    await mongoose.connect(URI);
    console.log("Databse connection Succesful");
  } catch (error) {
    console.log("Databse connection failed");
    process.exit(0);
  }
};

module.exports = connectDb;
