const express = require('express');
const app = express();
const router = require("./router/auth-router")
const connectDb = require("./utils/db");
require("dotenv").config();
const PORT= process.env.PORT || 3000;
const eventHostRoutes = require('./router/eventHostRoutes');
const eventRoutes = require('./router/eventRoutes');
const auctionRoutes = require('./router/auctionRoutes');
const sponsorRoutes = require('./router/sponsorRoutes');
const authrouter = require('./router/auth-router');
const userRoutes = require('./router/userRoutes');

const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  app.set('socketio', io);

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('placeBid', (bidData) => {
      console.log('New bid placed:', bidData);
      io.emit('newBid', bidData);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
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
app.use('/api/users',userRoutes)
app.use('/api/eventhosts', eventHostRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/auth',authrouter);
app.use('/api', auctionRoutes);
