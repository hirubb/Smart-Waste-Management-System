const express = require('express');
const router = express.Router();
const { register, login, me, getAllCollectors, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth(), me);
router.put('/update-profile', auth(), updateProfile);

// Get all collectors
router.get("/collectors", getAllCollectors);

module.exports = router;
