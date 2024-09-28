const EventHost = require('../models/eventHostModel');

// Create a new EventHost
exports.createEventHost = async (req, res) => {
  try {
    const eventHost = new EventHost(req.body);
    await eventHost.save();
    res.status(201).json(eventHost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Read all EventHosts
exports.getAllEventHosts = async (req, res) => {
  try {
    const eventHosts = await EventHost.find().populate('events');
    res.status(200).json(eventHosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read a single EventHost by ID
exports.getEventHostById = async (req, res) => {
  try {
    const eventHost = await EventHost.findById(req.params.id).populate('events');
    if (!eventHost) return res.status(404).json({ message: 'EventHost not found' });
    res.status(200).json(eventHost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an EventHost
exports.updateEventHost = async (req, res) => {
  try {
    const eventHost = await EventHost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!eventHost) return res.status(404).json({ message: 'EventHost not found' });
    res.status(200).json(eventHost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an EventHost
exports.deleteEventHost = async (req, res) => {
  try {
    const eventHost = await EventHost.findByIdAndDelete(req.params.id);
    if (!eventHost) return res.status(404).json({ message: 'EventHost not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
