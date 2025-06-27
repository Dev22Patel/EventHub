const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const authentication = require('../middlewares/authentication');

router.get('/events/:eventId/auctions/:auctionId', auctionController.getAuctionForEvent);
router.post('/events/:eventId/auctions/:auctionId/bids', auctionController.placeBid);
router.post('/createAuction', auctionController.createAuction);
router.get('/', auctionController.getAllAuctions);
router.get('/:id', auctionController.getAuctionById);
router.put('/:id', auctionController.updateAuction);
router.delete('/:id', auctionController.deleteAuction);
router.get('/admin/queue/status', auctionController.getQueueStatus);
router.post('/admin/queue/retry-failed', auctionController.retryFailedJobs);
router.post('/admin/queue/clean', auctionController.cleanQueue);

module.exports = router;
