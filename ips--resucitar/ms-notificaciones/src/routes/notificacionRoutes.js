const express = require('express');
const router = express.Router();
const { crearNotificacion, listarNotificacionesPorCita } = require('../controllers/notificacionController');

router.post('/', crearNotificacion);
router.get('/cita/:id', listarNotificacionesPorCita);

module.exports = router;