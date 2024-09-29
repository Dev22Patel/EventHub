const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    eventType: { type: String, enum: ['in-person', 'virtual'], required: true },
    location: { type: String, required: function() { return this.eventType === 'in-person'; } },
    date: { type: Date, required: true },
    image: { type: String }, // URL to the uploaded image
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    auctions: [{ type: Schema.Types.ObjectId, ref: 'Auction' }], // Added field for auctions
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  module.exports = mongoose.model('Event', eventSchema);
