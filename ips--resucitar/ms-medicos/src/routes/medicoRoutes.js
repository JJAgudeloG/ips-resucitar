const express = require('express');
const router = express.Router();
const {
    listarMedicos,
    obtenerMedicoPorId,
    crearMedico,
    actualizarMedico,
    eliminarMedico
} = require('../controllers/medicoController');
const {
    listarDisponibilidadPorMedico,
    crearDisponibilidad,
    eliminarDisponibilidad
} = require('../controllers/disponibilidadController');

router.get('/', listarMedicos);
router.get('/:id', obtenerMedicoPorId);
router.post('/', crearMedico);
router.put('/:id', actualizarMedico);
router.delete('/:id', eliminarMedico);


router.get('/:id/disponibilidad', listarDisponibilidadPorMedico);
router.post('/:id/disponibilidad', crearDisponibilidad);
router.delete('/:id/disponibilidad/:idDisponibilidad', eliminarDisponibilidad);

module.exports = router;