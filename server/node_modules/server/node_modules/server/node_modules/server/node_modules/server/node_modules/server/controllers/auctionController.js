const Event = require('../models/eventModel');
const mongoose = require('mongoose');
const Auction = require('../models/auctionModel');

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

// Get auction for a specific event
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

        res.status(200).json(auction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Place a bid for an auction
exports.placeBid = async (req, res) => {
    const { auctionId } = req.params;
    const { amount } = req.body;

    try {
        const auction = await Auction.findById(auctionId);

        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Validate bid amount
        if (amount <= auction.currentHighestBid || amount < auction.startingBid) {
            return res.status(400).json({ message: 'Bid must be higher than the current highest bid and starting bid' });
        }

        // Create new bid object
        const newBid = {
            bidder: req._id, // Ensure user is authenticated
            amount,
            createdAt: new Date(),
        };

        // Update auction bids
        auction.bids.push(newBid);
        auction.currentHighestBid = amount; // Update current highest bid
        await auction.save();

        return res.status(200).json(auction);
    } catch (error) {
        console.error('Error placing bid:', error); // Log the error for debugging
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
