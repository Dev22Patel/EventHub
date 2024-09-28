const Auction = require('../models/auctionModel');
const Event = require('../models/eventModel');

// Create a new Auction
exports.createAuction = async (req, res) => {
  try {
    const auction = new Auction(req.body);
    await auction.save();

    // Associate auction with the event
    const event = await Event.findById(req.body.event);
    if (event) {
      event.auctions.push(auction._id);
      await event.save();
    }

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
