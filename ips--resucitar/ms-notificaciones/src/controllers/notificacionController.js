const axios = require('axios');
const pool = require('../config/db');

const crearNotificacion = async (req, res) => {
    try {
        const { id_cita, tipo, medio } = req.body;

        const tiposValidos = ['confirmacion', 'recordatorio', 'cancelacion'];
        const mediosValidos = ['correo', 'sms'];

        if (!id_cita || !tipo || !medio) {
            return res.status(400).json({ mensaje: 'id_cita, tipo y medio son obligatorios' });
        }
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({ mensaje: `tipo debe ser uno de: ${tiposValidos.join(', ')}` });
        }
        if (!mediosValidos.includes(medio)) {
            return res.status(400).json({ mensaje: `medio debe ser uno de: ${mediosValidos.join(', ')}` });
        }

        try {
            await axios.get(`${process.env.URL_CITAS}/citas/${id_cita}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(400).json({ mensaje: 'La cita indicada no existe' });
            }
            return res.status(503).json({ mensaje: 'No se pudo verificar la cita (servicio no disponible)' });
        }

        const [resultado] = await pool.query(
            `INSERT INTO notificacion (id_cita, tipo, medio, fecha_envio, estado)
             VALUES (?, ?, ?, NOW(), true)`,
            [id_cita, tipo, medio]
        );

        res.status(201).json({
            mensaje: 'Notificación registrada correctamente',
            id_notificacion: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear notificación:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const listarNotificacionesPorCita = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM notificacion WHERE id_cita = ? ORDER BY fecha_envio DESC',
            [id]
        );

        res.json(rows);
    } catch (error) {
        console.error('Error al listar notificaciones:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

module.exports = { crearNotificacion, listarNotificacionesPorCita };