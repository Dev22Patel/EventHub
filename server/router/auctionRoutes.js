const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

router.post('/', auctionController.createAuction);
router.get('/', auctionController.getAllAuctions);
router.get('/:id', auctionController.getAuctionById);
router.put('/:id', auctionController.updateAuction);
router.delete('/:id', auctionController.deleteAuction);

module.exports = router;
