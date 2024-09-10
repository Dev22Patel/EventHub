const express = require('express');
const app = express();
const router = require("./router/auth-router")
const connectDb = require("./utils/db");
const PORT=3000;

connectDb().then(()=>{
    app.listen(PORT, () => {
        console.log('Server is running on port 3000');
      });
})

app.use("/api/auth",router);
