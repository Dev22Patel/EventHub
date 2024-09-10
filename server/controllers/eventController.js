const Event = require('../models/eventModel');
const EventHost = require('../models/eventHostModel');

// Create a new Event
exports.createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();

    // Associate event with the event host
    const host = await EventHost.findById(req.body.host);
    if (host) {
      host.events.push(event._id);
      await host.save();
    }

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read all Events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('host').populate('auctions');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read a single Event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('host').populate('auctions');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an Event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
