const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const auctionSchema = new Schema({
  item: { type: String, required: true },
  startingBid: { type: Number, required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  endDate: { type: Date, required: true },
  bids: [
    {
      sponsor: { type: Schema.Types.ObjectId, ref: 'Sponsor' },
      amount: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model('Auction', auctionSchema);
