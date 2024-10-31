const mongoose = require("mongoose");
require("dotenv").config();
const URI = process.env.DATABASE_URL || "mongodb+srv://notrealdev2211:Devpatel2004@cluster0.h05ou.mongodb.net/test";
// mongoose.connect(URI);

const connectDb = async () => {
  try {
    await mongoose.connect(URI);
    console.log(URI);
    console.log("Databse connection Succesful");
  } catch (error) {
    console.log("Databse connection failed");
    process.exit(0);
  }
};

module.exports = connectDb;
