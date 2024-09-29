const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

router.post('/createAuction', auctionController.createAuction);
router.get('/', auctionController.getAllAuctions);
router.get('/:id', auctionController.getAuctionById);
router.put('/:id', auctionController.updateAuction);
router.delete('/:id', auctionController.deleteAuction);
router.get('/events/:eventId/auctions/:auctionId', auctionController.getAuctionForEvent);
router.post('/events/:eventId/auctions/:auctionId/bids', auctionController.placeBid);

module.exports = router;
