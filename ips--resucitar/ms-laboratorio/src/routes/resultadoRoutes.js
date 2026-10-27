const express = require('express');
const router = express.Router();
const { registrarResultado, listarResultadosPorPaciente } = require('../controllers/resultadoController');

router.post('/', registrarResultado);
router.get('/paciente/:id', listarResultadosPorPaciente);

module.exports = router;