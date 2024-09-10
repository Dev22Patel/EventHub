const mongoose = require('mongoose');
const URI = "mongodb://127.0.0.1:27017/EventHost";
// mongoose.connect(URI);

const connectDb = async () =>{
    try{
        await mongoose.connect(URI);
        console.log("Databse connection Succesful");
    }catch(error){
        console.log("Databse connection failed");
        process.exit(0);
    }
}


module.exports = connectDb;
