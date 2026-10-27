const express = require('express');
const router = express.Router();
const {
    listarServicios,
    crearServicio,
    obtenerServicioPorId,
    actualizarServicio,
    eliminarServicio
} = require('../controllers/servicioController');

router.get('/', listarServicios);
router.get('/:id', obtenerServicioPorId);
router.post('/', crearServicio);
router.put('/:id', actualizarServicio);
router.delete('/:id', eliminarServicio);

module.exports = router;