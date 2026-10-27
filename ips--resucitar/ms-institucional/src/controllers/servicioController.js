const pool = require('../config/db');

const listarServicios = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM servicio WHERE estado = true ORDER BY nombre'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al listar servicios:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const crearServicio = async (req, res) => {
    try {
        const { nombre, descripcion, precio, duracion_minutos, id_informacion } = req.body;

        if (!nombre || !precio || !id_informacion) {
            return res.status(400).json({ mensaje: 'nombre, precio e id_informacion son obligatorios' });
        }

        const [resultado] = await pool.query(
            `INSERT INTO servicio (nombre, descripcion, precio, duracion_minutos, id_informacion, estado)
             VALUES (?, ?, ?, ?, ?, true)`,
            [nombre, descripcion, precio, duracion_minutos, id_informacion]
        );

        res.status(201).json({
            mensaje: 'Servicio creado correctamente',
            id_servicio: resultado.insertId
        });
    } catch (error) {
        console.error('Error al crear servicio:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const obtenerServicioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM servicio WHERE id_servicio = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Servicio no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener servicio:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const actualizarServicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, duracion_minutos, id_informacion } = req.body;

        const [resultado] = await pool.query(
            `UPDATE servicio
             SET nombre = ?, descripcion = ?, precio = ?, duracion_minutos = ?, id_informacion = ?
             WHERE id_servicio = ?`,
            [nombre, descripcion, precio, duracion_minutos, id_informacion, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Servicio no encontrado' });
        }

        res.json({ mensaje: 'Servicio actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar servicio:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const eliminarServicio = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            'UPDATE servicio SET estado = false WHERE id_servicio = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Servicio no encontrado' });
        }

        res.json({ mensaje: 'Servicio desactivado correctamente' });
    } catch (error) {
        console.error('Error al eliminar servicio:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

module.exports = {
    listarServicios,
    crearServicio,
    obtenerServicioPorId,
    actualizarServicio,
    eliminarServicio
};