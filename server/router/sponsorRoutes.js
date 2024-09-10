const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');

// Route to create a new sponsor
router.post('/create', sponsorController.createSponsor);

// Route to place a bid in an auction
router.post('/:sponsorId/bids', sponsorController.placeBid);

// Route to view all sponsors
router.get('/', sponsorController.getAllSponsors);

// Route to view a single sponsor by ID
router.get('/:id', sponsorController.getSponsorById);

module.exports = router;
