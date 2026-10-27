const express = require('express');
const router = express.Router();
const { crearCita, cambiarEstadoCita, listarCitasPorPaciente, obtenerCitaPorId, listarTodasLasCitas } = require('../controllers/citaController');

router.get('/paciente/:id', listarCitasPorPaciente);
router.get('/todas', listarTodasLasCitas);
router.get('/:id', obtenerCitaPorId);
router.post('/', crearCita);
router.put('/:id/estado', cambiarEstadoCita);

module.exports = router;