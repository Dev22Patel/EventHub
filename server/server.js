const express = require('express');
const app = express();
const router = require("./router/auth-router")
const connectDb = require("./utils/db");
const PORT=3000;
const eventHostRoutes = require('./router/eventHostRoutes');
const eventRoutes = require('./router/eventRoutes');
const auctionRoutes = require('./router/auctionRoutes');
const sponsorRoutes = require('./router/sponsorRoutes');

connectDb().then(()=>{
    app.listen(PORT, () => {
        console.log('Server is running on port 3000');
      });
})

app.use(express.json()); // For parsing application/json

// Routes
app.use('/api/eventhosts', eventHostRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/sponsors', sponsorRoutes);
