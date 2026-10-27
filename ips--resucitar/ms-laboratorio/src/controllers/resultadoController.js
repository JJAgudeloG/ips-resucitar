const axios = require('axios');
const pool = require('../config/db');

const registrarResultado = async (req, res) => {
    try {
        const { id_paciente, fecha, tipo_examen, resultado, observaciones } = req.body;

        if (!id_paciente || !fecha || !tipo_examen) {
            return res.status(400).json({ mensaje: 'id_paciente, fecha y tipo_examen son obligatorios' });
        }

        try {
            await axios.get(`${process.env.URL_PACIENTES}/pacientes/existe/${id_paciente}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(400).json({ mensaje: 'El paciente indicado no existe' });
            }
            return res.status(503).json({ mensaje: 'No se pudo verificar el paciente (servicio no disponible)' });
        }

        const [resultadoInsert] = await pool.query(
            `INSERT INTO resultado_laboratorio (id_paciente, fecha, tipo_examen, resultado, observaciones, estado)
             VALUES (?, ?, ?, ?, ?, true)`,
            [id_paciente, fecha, tipo_examen, resultado, observaciones]
        );

        res.status(201).json({
            mensaje: 'Resultado registrado correctamente',
            id_resultado: resultadoInsert.insertId
        });
    } catch (error) {
        console.error('Error al registrar resultado:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const listarResultadosPorPaciente = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM resultado_laboratorio WHERE id_paciente = ? AND estado = true ORDER BY fecha DESC',
            [id]
        );

        res.json(rows);
    } catch (error) {
        console.error('Error al listar resultados:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

module.exports = { registrarResultado, listarResultadosPorPaciente };