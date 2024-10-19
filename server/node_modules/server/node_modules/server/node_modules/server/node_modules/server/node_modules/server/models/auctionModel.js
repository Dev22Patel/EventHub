const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auctionSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  itemName: { type: String, required: true },
  itemDescription: { type: String, required: true },
  startingBid: { type: Number, required: true },
  bidIncrement: { type: Number, required: true },
  duration: { type: Number, required: true }, // in mins I guess :(
  status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
  currentHighestBid: { type: Number, default: 0 },
  bids: [{
    bidder: { type: Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Auction', auctionSchema);
