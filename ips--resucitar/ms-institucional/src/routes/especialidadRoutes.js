const express = require('express');
const router = express.Router();
const {
    listarEspecialidades,
    obtenerEspecialidadPorId,
    crearEspecialidad,
    actualizarEspecialidad,
    eliminarEspecialidad
} = require('../controllers/especialidadController');

router.get('/', listarEspecialidades);
router.get('/:id', obtenerEspecialidadPorId);
router.post('/', crearEspecialidad);
router.put('/:id', actualizarEspecialidad);
router.delete('/:id', eliminarEspecialidad);

module.exports = router;