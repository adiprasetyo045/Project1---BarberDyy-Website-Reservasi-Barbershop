const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const auth = require('../middleware/auth');
router.get('/', barberController.getAllBarbers);
router.post('/', auth, barberController.createBarber);
router.delete('/:id', auth, barberController.deleteBarber);
module.exports = router;