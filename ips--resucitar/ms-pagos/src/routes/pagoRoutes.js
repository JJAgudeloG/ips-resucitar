const express = require('express');
const router = express.Router();
const { registrarPago, confirmarPago, listarPagosPorCita } = require('../controllers/pagoController');

router.post('/', registrarPago);
router.put('/:id/confirmar', confirmarPago);
router.get('/cita/:id', listarPagosPorCita);

module.exports = router;