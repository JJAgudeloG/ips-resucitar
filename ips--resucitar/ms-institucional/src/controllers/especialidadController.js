const pool = require('../config/db');

const listarEspecialidades = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM especialidad WHERE estado = true ORDER BY nombre'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al listar especialidades:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const obtenerEspecialidadPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM especialidad WHERE id_especialidad = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Especialidad no encontrada' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener especialidad:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const crearEspecialidad = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({ mensaje: 'nombre es obligatorio' });
        }

        const [resultado] = await pool.query(
            'INSERT INTO especialidad (nombre, descripcion, estado) VALUES (?, ?, true)',
            [nombre, descripcion]
        );

        res.status(201).json({
            mensaje: 'Especialidad creada correctamente',
            id_especialidad: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear especialidad:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const actualizarEspecialidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const [resultado] = await pool.query(
            'UPDATE especialidad SET nombre = ?, descripcion = ? WHERE id_especialidad = ?',
            [nombre, descripcion, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Especialidad no encontrada' });
        }

        res.json({ mensaje: 'Especialidad actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar especialidad:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const eliminarEspecialidad = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            'UPDATE especialidad SET estado = false WHERE id_especialidad = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Especialidad no encontrada' });
        }

        res.json({ mensaje: 'Especialidad desactivada correctamente' });
    } catch (error) {
        console.error('Error al eliminar especialidad:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

module.exports = {
    listarEspecialidades,
    obtenerEspecialidadPorId,
    crearEspecialidad,
    actualizarEspecialidad,
    eliminarEspecialidad
};