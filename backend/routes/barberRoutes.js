const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barberController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // 👈 Wajib ada ini

// Public: User bisa lihat list barber
router.get('/', barberController.getAllBarbers);

// Admin: Tambah Barber (Pakai upload.single('image'))
// 'image' harus sama dengan name di form frontend/Postman
router.post('/', auth, upload.single('image'), barberController.createBarber);

// Admin: Hapus Barber
router.delete('/:id', auth, barberController.deleteBarber);

module.exports = router;