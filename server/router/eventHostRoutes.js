const express = require('express');
const router = express.Router();
const eventHostController = require('../controllers/eventHostController');

router.post('/', eventHostController.createEventHost);
router.get('/', eventHostController.getAllEventHosts);
router.get('/:id', eventHostController.getEventHostById);
router.put('/:id', eventHostController.updateEventHost);
router.delete('/:id', eventHostController.deleteEventHost);

module.exports = router;
