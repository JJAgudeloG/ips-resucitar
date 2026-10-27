const express = require('express');
const router = express.Router();
const { registrarAdmin, loginAdmin } = require('../controllers/authController');

router.post('/registro', registrarAdmin);
router.post('/login', loginAdmin);

module.exports = router;