const express = require('express');
const app = express();
const router = require("./router/auth-router")
const connectDb = require("./utils/db");
const PORT=3000;
const eventHostRoutes = require('./router/eventHostRoutes');
const eventRoutes = require('./router/eventRoutes');
const auctionRoutes = require('./router/auctionRoutes');
const sponsorRoutes = require('./router/sponsorRoutes');
const authrouter = require('./router/auth-router');
const cors = require('cors');

connectDb().then(()=>{
    app.listen(PORT, () => {
        console.log('Server is running on port 3000');
      });
})

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({extended:true}));
const corsOption = {
    origin: 'http://localhost:5173', // Corrected here
    credentials: true
};

app.use(cors(corsOption));
// Routes
app.use('/api/eventhosts', eventHostRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/auth',authrouter);
