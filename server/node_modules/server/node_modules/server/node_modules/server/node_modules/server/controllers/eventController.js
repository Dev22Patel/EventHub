const Event = require('../models/eventModel');
const Auction = require('../models/auctionModel');
const User = require('../models/user-model');

   const uploadImage = async (file) => {
     if (!file) return null;
     // Implement your image upload logic here
     // Return the image URL or path
   };

   const createAuctions = async (auctionsData, eventId) => {
     const auctionPromises = auctionsData.map(async (auctionData) => {
       const auction = new Auction({
         ...auctionData,
         event: eventId,
       });
       await auction.save();
       return auction._id;
     });
     return Promise.all(auctionPromises);
   };

   exports.createEvent = async (req, res) => {
    try {
      console.log('Received request body:', req.body);
    //   console.log('Received files:', req.file);

      const { auctions, ...eventData } = req.body;
      const host = req.body.host;

      console.log('Host ID:', host);

      if (!host) {
        return res.status(400).json({ error: 'Host ID is required' });
      }

      const imagePath = await uploadImage(req.file);

      const event = new Event({
        ...eventData,
        image: imagePath,
        host: host,
      });

      await event.save();

      const parsedAuctions = JSON.parse(auctions);
      const auctionIds = await createAuctions(parsedAuctions, event._id);

      event.auctions = auctionIds;
      await event.save();

      await User.findByIdAndUpdate(host, { $push: { events: event._id } });

      res.status(201).json(event);
    } catch (error) {
      console.error('Error in createEvent:', error);
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

exports.getHostedEvents = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId).populate('events');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // console.log(user);
        res.status(200).json(user.events);
    } catch (error) {
        console.error('Error fetching hosted events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getSponsoredEvents = async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId).populate('participatedAuctions');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // console.log("bidder starts");
        // console.log(user);

        res.status(200).json(user.sponsoredEvents);
    } catch (error) {
        console.error('Error fetching sponsored events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
