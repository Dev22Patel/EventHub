const mongoose = require('mongoose');
const Auction = require('../models/auctionModel');
const User = require('../models/user-model');
const { queueEmail } = require('../utils/queue');
const { calculateLeaderboard, emitLeaderboardUpdate } = require('../utils/leaderboard');

// const getUsersInParallel = async (userIds) => {
//     try {
//         const users = await User.find({ _id: { $in: userIds } })
//             .select('email name')
//             .lean()
//             .exec();
//         return users.reduce((acc, user) => {
//             acc[user._id.toString()] = user;
//             return acc;
//         }, {});
//     } catch (error) {
//         console.error('Error fetching users:', error);
//         return {};
//     }
// };

// const processAuctionEndEmails = async (auction, eventId, auctionEndTime) => {
//     try {
//         const userIds = [auction.event.host];
//         if (auction.bids.length > 0) {
//             const winningBid = auction.bids.reduce((prev, current) =>
//                 (prev.amount > current.amount) ? prev : current
//             );
//             userIds.push(winningBid.bidder);
//         }

//         const users = await getUsersInParallel(userIds);
//         const host = users[auction.event.host.toString()];

//         if (!host?.email) {
//             console.error('Host email not found');
//             return;
//         }

//         if (auction.bids.length > 0) {
//             const winningBid = auction.bids.reduce((prev, current) =>
//                 (prev.amount > current.amount) ? prev : current
//             );
//             const winner = users[winningBid.bidder.toString()];

//             if (winner?.email) {
//                 const winnerEmailMessage = `
//                     <h2>Congratulations! You've Won the Auction!</h2>
//                     <p>You are the winning bidder for "${auction.itemName}"</p>
//                     <p>Winning Bid: $${winningBid.amount.toLocaleString()}</p>
//                     <p>Auction End Time: ${auctionEndTime.toLocaleString()}</p>
//                     <p>The event host will contact you soon with further details.</p>
//                 `;
//                 queueEmail(
//                     winner.email,
//                     `Auction Won - ${auction.itemName}`,
//                     winnerEmailMessage,
//                     {
//                         priority: 10,
//                         metadata: {
//                             type: 'auction_winner',
//                             auctionId: auction._id.toString(),
//                             eventId
//                         }
//                     }
//                 );
//             }

//             const hostEmailMessage = `
//                 <h2>Your Auction Has Ended!</h2>
//                 <p>The auction for "${auction.itemName}" has ended.</p>
//                 <p>Winning Bid: $${winningBid.amount.toLocaleString()}</p>
//                 <p>Winner Email: ${winner?.email || 'Email not available'}</p>
//                 <p>Please contact the winner to arrange delivery/payment.</p>
//             `;
//             queueEmail(
//                 host.email,
//                 `Auction Ended - ${auction.itemName}`,
//                 hostEmailMessage,
//                 {
//                     priority: 10,
//                     metadata: {
//                         type: 'auction_ended_with_winner',
//                         auctionId: auction._id.toString(),
//                         eventId
//                     }
//                 }
//             );
//         } else {
//             const noBidsMessage = `
//                 <h2>Your Auction Has Ended</h2>
//                 <p>The auction for "${auction.itemName}" has ended.</p>
//                 <p>Unfortunately, no bids were placed on this item.</p>
//                 <p>End Time: ${auctionEndTime.toLocaleString()}</p>
//             `;
//             queueEmail(
//                 host.email,
//                 `Auction Ended - ${auction.itemName}`,
//                 noBidsMessage,
//                 {
//                     priority: 5,
//                     metadata: {
//                         type: 'auction_ended_no_bids',
//                         auctionId: auction._id.toString(),
//                         eventId
//                     }
//                 }
//             );
//         }
//     } catch (error) {
//         console.error('Error processing auction end emails:', error);
//     }
// };

const processBidEmails = async (auction, bidderId, amount, now, auctionEndTime) => {
    try {
        const users = await getUsersInParallel([auction.event.host, bidderId]);
        const host = users[auction.event.host.toString()];
        const bidder = users[bidderId.toString()];

        if (host?.email) {
            const hostEmailMessage = `
                <h2>New Bid Placed!</h2>
                <p>A new bid has been placed on your auction item "${auction.itemName}"</p>
                <p>Bid Amount: $${amount.toLocaleString()}</p>
                <p>Time: ${now.toLocaleString()}</p>
                <p>Auction End Time: ${auctionEndTime.toLocaleString()}</p>
            `;
            queueEmail(
                host.email,
                `New Bid on ${auction.itemName}`,
                hostEmailMessage,
                {
                    priority: 8,
                    metadata: {
                        type: 'new_bid_host_notification',
                        auctionId: auction._id.toString(),
                        bidAmount: amount
                    }
                }
            );
        }

        if (bidder?.email) {
            const bidderEmailMessage = `
                <h2>Bid Confirmation</h2>
                <p>Your bid has been successfully placed!</p>
                <p>Item: ${auction.itemName}</p>
                <p>Your Bid: $${amount.toLocaleString()}</p>
                <p>Time: ${now.toLocaleString()}</p>
                <p>Auction End Time: ${auctionEndTime.toLocaleString()}</p>
            `;
            queueEmail(
                bidder.email,
                `Bid Confirmation - ${auction.itemName}`,
                bidderEmailMessage,
                {
                    priority: 7,
                    metadata: {
                        type: 'bid_confirmation',
                        auctionId: auction._id.toString(),
                        bidAmount: amount
                    }
                }
            );
        }
    } catch (error) {
        console.error('Error processing bid emails:', error);
    }
};

exports.getAuctionForEvent = async (req, res) => {
    try {
        const { eventId, auctionId } = req.params;
        const io = req.app.get('socketio');

        if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(auctionId)) {
            return res.status(400).json({ error: "Invalid event ID or auction ID" });
        }

        const auction = await Auction.findOne({ _id: auctionId, event: eventId })
            .populate('event', 'host title')
            .lean()
            .exec();

        if (!auction) {
            return res.status(404).json({ message: 'Auction not found for this event' });
        }

        const now = new Date();
        const auctionEndTime = new Date(auction.createdAt.getTime() + auction.duration * 60 * 1000);

        if (now > auctionEndTime && auction.status === 'active') {
            setImmediate(async () => {
                try {
                    const updatedAuction = await Auction.findByIdAndUpdate(
                        auctionId,
                        { status: 'finished' },
                        { new: true }
                    ).populate('event', 'host title');
                    if (updatedAuction && io) {
                        emitLeaderboardUpdate(io, auctionId, updatedAuction, 'auction_ended');
                        await processAuctionEndEmails(updatedAuction, eventId, auctionEndTime);
                    }
                } catch (error) {
                    console.error('Error updating auction status:', error);
                }
            });
            auction.status = 'finished';
        }

        const leaderboardData = calculateLeaderboard(auction);
        const userId = req.user?.id || req.headers['user-id'];
        if (userId && io) {
            const userSockets = await io.in(`user_${userId}`).fetchSockets();
            userSockets.forEach(socket => socket.join(`auction_${auctionId}`));
        }

        res.status(200).json({
            ...auction,
            leaderboard: leaderboardData,
            serverTime: now,
            auctionEndTime
        });
    } catch (error) {
        console.error('Error in getAuctionForEvent:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.placeBid = async (req, res) => {
    const { auctionId } = req.params;
    const { amount, id, userId } = req.body;
    const io = req.app.get('socketio');

    try {
        const auction = await Auction.findById(auctionId)
            .populate('event', 'host title')
            .select('itemName startingBid currentHighestBid bidIncrement duration createdAt status bids event')
            .exec();

        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        const now = new Date();
        const auctionEndTime = new Date(auction.createdAt.getTime() + auction.duration * 60 * 1000);

        if (auction.status !== 'active') {
            return res.status(400).json({
                message: 'Auction is not active',
                serverTime: now,
                auctionEndTime
            });
        }

        if (now > auctionEndTime) {
            setImmediate(async () => {
                try {
                    const updatedAuction = await Auction.findByIdAndUpdate(auctionId, { status: 'finished' });
                    if (updatedAuction && io) {
                        emitLeaderboardUpdate(io, auctionId, updatedAuction, 'auction_ended');
                    }
                } catch (error) {
                    console.error('Error updating auction status:', error);
                }
            });
            return res.status(400).json({
                message: 'Auction has ended',
                serverTime: now,
                auctionEndTime
            });
        }

        if (auction.event.host.toString() === id) {
            return res.status(403).json({ message: 'Event hosts cannot bid on their own auctions' });
        }

        const lastBid = auction.bids[auction.bids.length - 1];
        if (lastBid && lastBid.bidder.toString() === id) {
            return res.status(400).json({
                message: 'You cannot place two consecutive bids. Wait for another sponsor to bid.'
            });
        }

        const minimumBid = Math.max(auction.startingBid, auction.currentHighestBid + auction.bidIncrement);
        if (amount < minimumBid) {
            return res.status(400).json({
                message: 'Invalid bid amount',
                currentHighestBid: auction.currentHighestBid,
                minimumBid
            });
        }

        const newBid = { bidder: id, amount, createdAt: now };
        auction.bids.push(newBid);
        auction.currentHighestBid = amount;

        const savePromises = [
            auction.save(),
            User.findByIdAndUpdate(userId, { $addToSet: { participatedAuctions: auctionId } }, { upsert: false })
        ];
        const [savedAuction] = await Promise.all(savePromises);

        if (io) {
            emitLeaderboardUpdate(io, auctionId, savedAuction, 'new_bid');
            setImmediate(async () => {
                try {
                    await processBidEmails(auction, id, amount, now, auctionEndTime);
                    const bidder = await User.findById(id).select('name').lean();
                    io.to(`auction_${auctionId}`).emit('new_bid', {
                        auctionId,
                        amount,
                        bidder: bidder ? { id: bidder._id, name: bidder.name } : null,
                        timestamp: now,
                        isNewLeader: true
                    });
                } catch (error) {
                    console.error('Error processing bid notifications:', error);
                }
            });
        }

        const leaderboardData = calculateLeaderboard(savedAuction);
        return res.status(200).json({
            ...savedAuction.toObject(),
            leaderboard: leaderboardData,
            serverTime: now,
            message: 'Bid placed successfully'
        });
    } catch (error) {
        console.error('Error placing bid:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.createAuction = async (req, res) => {
    try {
        const auctionData = req.body;
        if (!mongoose.Types.ObjectId.isValid(auctionData.event)) {
            return res.status(400).json({ error: "Invalid event ID" });
        }
        const auction = new Auction(auctionData);
        await auction.save();
        res.status(201).json(auction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find().populate('event');
        res.status(200).json(auctions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAuctionById = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id).populate('event');
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.status(200).json(auction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateAuction = async (req, res) => {
    try {
        const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.status(200).json(auction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteAuction = async (req, res) => {
    try {
        const auction = await Auction.findByIdAndDelete(req.params.id);
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getQueueStatus = async (req, res) => {
    try {
        const { mailQueue } = require('../utils/queue');
        const waiting = await mailQueue.getWaiting();
        const active = await mailQueue.getActive();
        const completed = await mailQueue.getCompleted();
        const failed = await mailQueue.getFailed();

        res.json({
            status: 'healthy',
            queue: {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length
            },
            jobs: {
                waiting: waiting.slice(0, 5).map(job => ({
                    id: job.id,
                    data: { to: job.data.to, type: job.data.metadata?.type }
                })),
                failed: failed.slice(0, 5).map(job => ({
                    id: job.id,
                    data: { to: job.data.to, type: job.data.metadata?.type },
                    failedReason: job.failedReason
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.retryFailedJobs = async (req, res) => {
    try {
        const { mailQueue } = require('../utils/queue');
        const failed = await mailQueue.getFailed();
        const retryPromises = failed.map(job => job.retry());
        await Promise.all(retryPromises);
        res.json({
            message: `Retried ${failed.length} failed email jobs`,
            retriedJobs: failed.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.cleanQueue = async (req, res) => {
    try {
        const { mailQueue } = require('../utils/queue');
        const grace = req.query.grace || 24 * 60 * 60 * 1000;
        const cleaned = await mailQueue.clean(grace, 'completed');
        const cleanedFailed = await mailQueue.clean(grace, 'failed');
        res.json({
            message: 'Queue cleaned successfully',
            cleanedCompleted: cleaned.length,
            cleanedFailed: cleanedFailed.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
