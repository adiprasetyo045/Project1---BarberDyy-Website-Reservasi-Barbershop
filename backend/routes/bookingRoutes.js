const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/booked-slots', bookingController.getBookedSlots);
router.post('/', auth, upload.single('payment_proof'), bookingController.createBooking);
router.get('/my-bookings', auth, bookingController.getUserBookings);

router.get('/admin/notifications', auth, bookingController.getNotificationCount);
router.get('/admin/all', auth, bookingController.getAllBookings);
router.put('/admin/:id/status', auth, bookingController.updateBookingStatus);

router.put('/cancel/:id', auth, bookingController.cancelBooking);

module.exports = router;