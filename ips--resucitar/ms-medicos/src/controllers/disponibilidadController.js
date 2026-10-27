const pool = require('../config/db');

const listarDisponibilidadPorMedico = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT * FROM disponibilidad
             WHERE id_medico = ? AND estado = true
             ORDER BY fecha, hora_inicio`,
            [id]
        );

        res.json(rows);
    } catch (error) {
        console.error('Error al listar disponibilidad:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const crearDisponibilidad = async (req, res) => {
    try {
        const { id } = req.params; // id_medico, viene de la URL
        const { fecha, hora_inicio, hora_fin, duracion_minutos } = req.body;

        if (!fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ mensaje: 'fecha, hora_inicio y hora_fin son obligatorios' });
        }

        const [resultado] = await pool.query(
            `INSERT INTO disponibilidad (id_medico, fecha, hora_inicio, hora_fin, duracion_minutos, estado)
             VALUES (?, ?, ?, ?, ?, true)`,
            [id, fecha, hora_inicio, hora_fin, duracion_minutos || 30]
        );

        res.status(201).json({
            mensaje: 'Disponibilidad creada correctamente',
            id_disponibilidad: resultado.insertId
        });
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ mensaje: 'El médico indicado no existe' });
        }
        console.error('Error al crear disponibilidad:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const eliminarDisponibilidad = async (req, res) => {
    try {
        const { idDisponibilidad } = req.params;

        const [resultado] = await pool.query(
            'UPDATE disponibilidad SET estado = false WHERE id_disponibilidad = ?',
            [idDisponibilidad]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Disponibilidad no encontrada' });
        }

        res.json({ mensaje: 'Disponibilidad desactivada correctamente' });
    } catch (error) {
        console.error('Error al eliminar disponibilidad:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

module.exports = { listarDisponibilidadPorMedico, crearDisponibilidad, eliminarDisponibilidad };