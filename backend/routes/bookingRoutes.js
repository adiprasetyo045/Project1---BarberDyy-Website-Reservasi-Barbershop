const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth'); 
const upload = require('../middleware/upload'); 
// 1. Notifikasi Lonceng (Jumlah Pending)
router.get('/admin/notifications', auth, bookingController.getNotificationCount);
// 2. Ambil Semua Data Booking (Dashboard)
router.get('/admin/all', auth, bookingController.getAllBookings);
// 3. Cek Slot (Untuk Dropdown Jam)
router.get('/booked-slots', bookingController.getBookedSlots);
// 4. Buat Booking Baru (Support Upload Bukti Bayar)
router.post('/', auth, upload.single('payment_proof'), bookingController.createBooking);
// 5. Lihat Riwayat Booking Saya
router.get('/my-bookings', auth, bookingController.getUserBookings);
// Menggunakan DELETE agar lebih semantik, tapi PUT juga boleh
router.delete('/:id', auth, bookingController.cancelBooking);
// 7. Update Status (Admin: Confirm/Reject/Complete)
router.put('/:id', auth, bookingController.updateBookingStatus);
module.exports = router;