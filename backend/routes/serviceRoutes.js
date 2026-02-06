const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/auth'); 
router.get('/', serviceController.getAllServices);
router.post('/', authMiddleware, serviceController.createService);
router.delete('/:id', authMiddleware, serviceController.deleteService);
module.exports = router;