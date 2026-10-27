const express = require('express');
const router = express.Router();
const { registrarPaciente, loginPaciente } = require('../controllers/authController');

router.post('/registro', registrarPaciente);
router.post('/login', loginPaciente);

module.exports = router;