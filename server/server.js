const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { handleSocketConnection } = require('./controllers/socketController');
const connectDb = require('./utils/db');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const eventHostRoutes = require('./router/eventHostRoutes');
const eventRoutes = require('./router/eventRoutes');
const auctionRoutes = require('./router/auctionRoutes');
const sponsorRoutes = require('./router/sponsorRoutes');
const authRoutes = require('./router/auth-router');
const userRoutes = require('./router/userRoutes');

const PORT = process.env.PORT || 3000;

const corsOption = {
    origin: ['https://event-hub-topaz-seven.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};

const io = socketIo(server, {
    cors: {
        origin: corsOption.origin,
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

app.set('socketio', io);
handleSocketConnection(io);

app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options('*', cors(corsOption));

app.use('/api/users', userRoutes);
app.use('/api/eventhosts', eventHostRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', auctionRoutes);

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        socketConnections: io.engine.clientsCount
    });
});

app.use(errorHandler);

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    io.close(() => console.log('Socket.IO server closed'));
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    io.close(() => console.log('Socket.IO server closed'));
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

connectDb().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Socket.IO server is ready for connections`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}).catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});
