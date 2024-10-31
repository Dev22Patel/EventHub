const express = require('express');
const app = express();
const router = require("./router/auth-router")
const connectDb = require("./utils/db");
require("dotenv").config();
const eventHostRoutes = require('./router/eventHostRoutes');
const eventRoutes = require('./router/eventRoutes');
const auctionRoutes = require('./router/auctionRoutes');
const sponsorRoutes = require('./router/sponsorRoutes');
const authrouter = require('./router/auth-router');
const userRoutes = require('./router/userRoutes');
const cors = require('cors');
const PORT = process.env.PORT || 3000;

connectDb().then(()=>{
    app.listen(PORT, () => {
        console.log('Server is running on port' , PORT);
      });
})

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({extended:true}));
const corsOption = {
    origin: 'https://eventhub-2dqv.onrender.com', // Corrected here
    credentials: true
};

app.use(cors(corsOption));
// Routes
app.use('/api/users',userRoutes)
app.use('/api/eventhosts', eventHostRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/auth',authrouter);
app.use('/api', auctionRoutes);
