const Auction = require('../models/auctionModel');
const { calculateLeaderboard, emitLeaderboardUpdate } = require('../utils/leaderboard');

exports.handleSocketConnection = (io) => {
    const activeConnections = new Map();

    io.on('connection', (socket) => {
        console.log(`New socket connection: ${socket.id}`);

        socket.on('authenticate', (data) => {
            const { userId, auctionId, eventId } = data;
            const connectionKey = `${userId}-${auctionId}`;

            if (activeConnections.has(connectionKey)) {
                console.log(`User ${userId} already authenticated for auction ${auctionId}`);
                sendInitialLeaderboard(socket, auctionId);
                return;
            }

            activeConnections.set(connectionKey, {
                socketId: socket.id,
                userId,
                auctionId,
                eventId,
                timestamp: new Date()
            });

            console.log(`Authenticating user ${userId} for auction ${auctionId}`);

            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`User ${userId} joined user room`);
            }

            if (auctionId) {
                socket.join(`auction_${auctionId}`);
                console.log(`User ${userId} joined auction room: auction_${auctionId}`);
                sendInitialLeaderboard(socket, auctionId);
            }

            if (eventId) {
                socket.join(`event_${eventId}`);
                console.log(`User ${userId} joined event room: event_${eventId}`);
            }

            socket.userData = { userId, auctionId, eventId, connectionKey };
        });

        const sendInitialLeaderboard = async (socket, auctionId) => {
            try {
                const auction = await Auction.findById(auctionId)
                    .populate('event', 'host title')
                    .lean();
                if (auction) {
                    const leaderboardData = calculateLeaderboard(auction);
                    const now = new Date();
                    const auctionEndTime = new Date(auction.createdAt.getTime() + auction.duration * 60 * 1000);
                    socket.emit('leaderboard_update', {
                        auctionId,
                        leaderboard: leaderboardData,
                        serverTime: now,
                        auctionEndTime,
                        status: auction.status,
                        updateType: 'initial_load',
                        timestamp: now
                    });
                }
            } catch (error) {
                console.error('Error sending initial leaderboard:', error);
                socket.emit('error', { message: 'Failed to load auction data' });
            }
        };

        socket.on('request_leaderboard', async (data) => {
            const { auctionId } = data;
            try {
                const auction = await Auction.findById(auctionId)
                    .populate('event', 'host title')
                    .lean();
                if (auction) {
                    const leaderboardData = calculateLeaderboard(auction);
                    const now = new Date();
                    const auctionEndTime = new Date(auction.createdAt.getTime() + auction.duration * 60 * 1000);
                    socket.emit('leaderboard_update', {
                        auctionId,
                        leaderboard: leaderboardData,
                        serverTime: now,
                        auctionEndTime,
                        status: auction.status,
                        updateType: 'manual_refresh',
                        timestamp: now
                    });
                }
            } catch (error) {
                console.error('Error handling leaderboard request:', error);
                socket.emit('error', { message: 'Failed to fetch leaderboard data' });
            }
        });

        socket.on('leave_auction', (data) => {
            const { auctionId } = data;
            if (auctionId) {
                socket.leave(`auction_${auctionId}`);
                console.log(`Socket ${socket.id} left auction room: auction_${auctionId}`);
                if (socket.userData?.connectionKey) {
                    activeConnections.delete(socket.userData.connectionKey);
                }
            }
        });

        socket.on('disconnect', (reason) => {
            console.log(`Socket ${socket.id} disconnected: ${reason}`);
            if (socket.userData?.connectionKey) {
                const connection = activeConnections.get(socket.userData.connectionKey);
                if (connection && connection.socketId === socket.id) {
                    activeConnections.delete(socket.userData.connectionKey);
                    console.log(`Cleaned up connection for ${socket.userData.connectionKey}`);
                }
            }
        });

        socket.on('error', (error) => {
            console.error(`Socket ${socket.id} error:`, error);
        });
    });

    setInterval(() => {
        const now = new Date();
        const staleThreshold = 5 * 60 * 1000;
        for (const [key, connection] of activeConnections.entries()) {
            if (now - connection.timestamp > staleThreshold) {
                const socket = io.sockets.sockets.get(connection.socketId);
                if (!socket || !socket.connected) {
                    activeConnections.delete(key);
                    console.log(`Cleaned up stale connection: ${key}`);
                }
            }
        }
    }, 60000);

    io.getActiveConnectionsCount = () => activeConnections.size;
    io.getActiveConnections = () => Array.from(activeConnections.entries());
};
