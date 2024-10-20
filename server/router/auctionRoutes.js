const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const authentication = require("../middlewares/authentication");

router.get('/events/:eventId/auctions/:auctionId', auctionController.getAuctionForEvent);
router.post('/events/:eventId/auctions/:auctionId/bids', auctionController.placeBid);

// Create auction route
router.post('/createAuction', auctionController.createAuction);

// General routes
router.get('/', auctionController.getAllAuctions);
router.get('/:id', auctionController.getAuctionById);
router.put('/:id', auctionController.updateAuction);
router.delete('/:id', auctionController.deleteAuction);

module.exports = router;
