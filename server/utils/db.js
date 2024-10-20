const mongoose = require("mongoose");
const URI = "mongodb://localhost:27017/temp";
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
