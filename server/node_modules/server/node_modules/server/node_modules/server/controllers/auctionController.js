const Event = require('../models/eventModel');
const mongoose = require('mongoose');
const Auction = require('../models/auctionModel');
const User = require('../models/user-model');
const sendMail = require('./emailController'); // Import the sendMail function
// Create a new Auction
exports.createAuction = async (req, res) => {
    try {
        const auctionData = req.body;

        // Validate event ID
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

// Read all Auctions
exports.getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find().populate('event');
        res.status(200).json(auctions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Read a single Auction by ID
exports.getAuctionById = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id).populate('event');
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.status(200).json(auction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an Auction
exports.updateAuction = async (req, res) => {
    try {
        const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.status(200).json(auction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an Auction
exports.deleteAuction = async (req, res) => {
    try {
        const auction = await Auction.findByIdAndDelete(req.params.id);
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getAuctionForEvent = async (req, res) => {
    try {
        const { eventId, auctionId } = req.params;

        // Validate eventId and auctionId
        if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(auctionId)) {
            return res.status(400).json({ error: "Invalid event ID or auction ID" });
        }

        // Find the auction
        const auction = await Auction.findOne({ _id: auctionId, event: eventId }).populate('event');

        if (!auction) {
            return res.status(404).json({ message: 'Auction not found for this event' });
        }

        const now = new Date();
        const auctionEndTime = new Date(auction.createdAt.getTime() + auction.duration * 60 * 1000);

        // Check if the auction should be marked as finished
        if (now > auctionEndTime && auction.status === 'active') {
            auction.status = 'finished';
            await auction.save();
        }

        // Return auction data along with server time and end time
        res.status(200).json({
            ...auction.toObject(),
            serverTime: now,
            auctionEndTime: auctionEndTime
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Place a bid for an auction

exports.placeBid = async (req, res) => {
    const { auctionId } = req.params;
    const { amount, id } = req.body;
    const io = req.app.get('socketio');

    try {
        const auction = await Auction.findById(auctionId).populate('event');

        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Check if the auction is still active
        const now = new Date();
        const auctionEndTime = new Date(auction.createdAt.getTime() + auction.duration * 60 * 1000);
        if (now > auctionEndTime) {
            auction.status = 'finished';
            await auction.save();
            return res.status(400).json({
                message: 'Auction has ended',
                serverTime: now,
                auctionEndTime: auctionEndTime
            });
        }

        // Check if the bidder is the event host
        if (auction.event.host.toString() === id) {
            return res.status(403).json({ message: 'Event hosts cannot bid on their own auctions' });
        }

        // Validate bid amount
        if (
            amount <= auction.currentHighestBid ||
            amount < auction.startingBid ||
            amount < auction.currentHighestBid + auction.bidIncrement
        ) {
            return res.status(400).json({
                message: 'Invalid bid amount',
                currentHighestBid: auction.currentHighestBid,
                minimumBid: Math.max(auction.startingBid, auction.currentHighestBid + auction.bidIncrement)
            });
        }

        // Create new bid object
        const newBid = {
            bidder: id,
            amount,
            createdAt: now,
        };

        // Update auction bids
        auction.bids.push(newBid);
        auction.currentHighestBid = amount;

        // Save the auction with the new bid
        await auction.save();

        // Update the user's participated auctions
        await User.findByIdAndUpdate(
            id,
            { $addToSet: { participatedAuctions: auction._id } },
            { new: true }
        );



        const auctionCreator = await User.findById(auction.event.host);
        if (auctionCreator && auctionCreator.email) {
            try {
                await sendMail(
                    auctionCreator.email,
                    'New bid on your auction',
                    `A new bid of $${amount} has been placed on your auction for ${auction.event.name}.`
                );
                console.log("mail sent");
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                // Don't throw the error, just log it
            }
        }


        return res.status(200).json({
            ...auction.toObject(),
            serverTime: now
        });
    } catch (error) {
        console.error('Error placing bid:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.checkAuctionStatus = async (req, res) => {
    const { auctionId } = req.params;

    try {
        const auction = await Auction.findById(auctionId);

        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        const now = new Date();
        const auctionEndTime = new Date(auction.createdAt.getTime() + auction.duration * 60 * 1000);

        // Only set to 'finished' if the auction is still 'active' and the end time has passed
        if (now > auctionEndTime && auction.status === 'active') {
            auction.status = 'finished';
            await auction.save();
            if (auction.bids.length > 0) {
                const winner = auction.bids.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);
                const winnerUser = await User.findById(winner.bidder);
                const auctionCreator = await User.findById(auction.event.host);

                // Email to the winner
                if (winnerUser && winnerUser.email) {
                    try {
                        await sendMail(
                            winnerUser.email,
                            'Congratulations! You won the auction',
                            `You have won the auction for ${auction.event.name} with a bid of $${winner.amount}.`
                        );
                        console.log("mail sent");
                    } catch (emailError) {
                        console.error('Error sending email to winner:', emailError);
                    }
                }

                // Email to the auction creator
                if (auctionCreator && auctionCreator.email) {
                    try {
                        await sendMail(
                            auctionCreator.email,
                            'Your auction has ended',
                            `Your auction for ${auction.event.name} has ended. The winning bid was $${winner.amount}.`
                        );
                    } catch (emailError) {
                        console.error('Error sending email to auction creator:', emailError);
                    }
                }
            }
        }

        // Return current status along with server time and auction end time
        return res.status(200).json({
            status: auction.status,
            serverTime: now,
            auctionEndTime: auctionEndTime
        });
    } catch (error) {
        console.error('Error checking auction status:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
