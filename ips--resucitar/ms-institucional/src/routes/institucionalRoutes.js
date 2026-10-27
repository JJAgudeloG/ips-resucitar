const express = require('express');
const router = express.Router();
const { obtenerInformacion, actualizarInformacion } = require('../controllers/institucionalController');

router.get('/', obtenerInformacion);
router.put('/:id', actualizarInformacion);

module.exports = router;