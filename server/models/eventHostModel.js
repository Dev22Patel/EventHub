const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventHostSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  events: [{ type: Schema.Types.ObjectId, ref: 'Event' }]
});

module.exports = mongoose.model('EventHost', eventHostSchema);
