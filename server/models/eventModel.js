const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  host: { type: Schema.Types.ObjectId, ref: 'EventHost', required: true },
  auctions: [{ type: Schema.Types.ObjectId, ref: 'Auction' }]
});

module.exports = mongoose.model('Event', eventSchema);
