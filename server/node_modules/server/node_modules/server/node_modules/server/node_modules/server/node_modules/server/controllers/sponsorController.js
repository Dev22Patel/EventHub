const Sponsor = require('../models/sponsorModel');
const Auction = require('../models/auctionModel');

// Create a new sponsor
exports.createSponsor = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const newSponsor = new Sponsor({ name, email, phone });
    await newSponsor.save();
    res.status(201).json(newSponsor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Place a bid in an auction
exports.placeBid = async (req, res) => {
  try {
    const { auctionId, amount } = req.body;
    const sponsorId = req.params.sponsorId;

    // Find the auction
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    // Ensure bid amount is greater than the starting bid
    if (amount <= auction.startingBid) {
      return res.status(400).json({ error: 'Bid amount must be greater than starting bid' });
    }

    // Check if the bid is higher than the current highest bid
    const highestBid = auction.bids.reduce((max, bid) => bid.amount > max ? bid.amount : max, 0);
    if (amount <= highestBid) {
      return res.status(400).json({ error: 'Bid must be higher than the current highest bid' });
    }

    // Add bid to the auction
    auction.bids.push({ sponsor: sponsorId, amount });
    await auction.save();

    // Add auction reference to sponsor
    const sponsor = await Sponsor.findById(sponsorId);
    sponsor.bids.push({ auction: auctionId, amount });
    await sponsor.save();

    res.status(200).json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSponsors = async (req, res) => {
    try {
      const sponsors = await Sponsor.find();
      res.status(200).json(sponsors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // View a single sponsor by ID
  exports.getSponsorById = async (req, res) => {
    try {
      const sponsor = await Sponsor.findById(req.params.id);
      if (!sponsor) {
        return res.status(404).json({ error: 'Sponsor not found' });
      }
      res.status(200).json(sponsor);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
