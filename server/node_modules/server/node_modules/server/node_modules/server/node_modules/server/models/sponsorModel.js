const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sponsorSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  bids: [
    {
      auction: { type: Schema.Types.ObjectId, ref: 'Auction' },
      amount: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model('Sponsor', sponsorSchema);
