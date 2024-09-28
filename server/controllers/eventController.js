const Event = require('../models/eventModel');
const EventHost = require('../models/eventHostModel');

// Create a new Event
exports.createEvent = async (req, res) => {
    try {
      const { auctions, ...eventData } = req.body;

      // Ensure auctions is an array
      const processedAuctions = Array.isArray(auctions) ? auctions : [];

      const eventDataWithAuctions = {
        ...eventData,
        auctions: processedAuctions.map(auction => ({
          ...auction,
          status: 'pending'
        }))
      };

      const event = new Event(eventDataWithAuctions);
      await event.save();

      // Associate event with the event host
      if (event.host) {
        await EventHost.findByIdAndUpdate(event.host, { $push: { events: event._id } });
      }

      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

// Read all Events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('host');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read a single Event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('host');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an Event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
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

    // Remove event reference from the host
    await EventHost.findByIdAndUpdate(event.host, { $pull: { events: event._id } });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add an auction to an event
exports.addAuction = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.auctions.push({ ...req.body, status: 'pending' });
    await event.save();

    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an auction in an event
exports.updateAuction = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.eventId, 'auctions._id': req.params.auctionId },
      { $set: { 'auctions.$': req.body } },
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: 'Event or auction not found' });

    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};