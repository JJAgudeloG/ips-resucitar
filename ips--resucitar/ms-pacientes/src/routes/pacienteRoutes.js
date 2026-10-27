const express = require('express');
const router = express.Router();
const { obtenerPerfilPaciente, actualizarPerfilPaciente, buscarPacientePorDocumento, verificarExistenciaPaciente } = require('../controllers/pacienteController');
const verificarToken = require('../middlewares/verificarToken');

router.get('/buscar/:documento', buscarPacientePorDocumento);
router.get('/existe/:id', verificarExistenciaPaciente);
router.get('/:id', verificarToken, obtenerPerfilPaciente);
router.put('/:id', verificarToken, actualizarPerfilPaciente);

module.exports = router;