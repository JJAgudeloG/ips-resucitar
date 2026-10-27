const pool = require('../config/db');

const listarMedicos = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT m.id_medico, m.nombre, m.apellido, m.documento, m.correo, m.telefono, m.estado,
                    e.id_especialidad, e.nombre AS especialidad
             FROM medico m
             JOIN especialidad e ON m.id_especialidad = e.id_especialidad
             WHERE m.estado = true
             ORDER BY m.apellido`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al listar médicos:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const obtenerMedicoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT m.id_medico, m.nombre, m.apellido, m.documento, m.correo, m.telefono, m.estado,
                    e.id_especialidad, e.nombre AS especialidad
             FROM medico m
             JOIN especialidad e ON m.id_especialidad = e.id_especialidad
             WHERE m.id_medico = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Médico no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener médico:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const crearMedico = async (req, res) => {
    try {
        const { nombre, apellido, documento, correo, telefono, id_especialidad } = req.body;

        if (!nombre || !apellido || !documento || !correo || !id_especialidad) {
            return res.status(400).json({
                mensaje: 'nombre, apellido, documento, correo e id_especialidad son obligatorios'
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO medico (nombre, apellido, documento, correo, telefono, id_especialidad, estado)
             VALUES (?, ?, ?, ?, ?, ?, true)`,
            [nombre, apellido, documento, correo, telefono, id_especialidad]
        );

        res.status(201).json({ mensaje: 'Médico creado correctamente', id_medico: resultado.insertId });
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ mensaje: 'La especialidad indicada no existe' });
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'Ya existe un médico con ese documento o correo' });
        }
        console.error('Error al crear médico:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const actualizarMedico = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, documento, correo, telefono, id_especialidad } = req.body;

        const [resultado] = await pool.query(
            `UPDATE medico
             SET nombre = ?, apellido = ?, documento = ?, correo = ?, telefono = ?, id_especialidad = ?
             WHERE id_medico = ?`,
            [nombre, apellido, documento, correo, telefono, id_especialidad, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Médico no encontrado' });
        }

        res.json({ mensaje: 'Médico actualizado correctamente' });
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ mensaje: 'La especialidad indicada no existe' });
        }
        console.error('Error al actualizar médico:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const eliminarMedico = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            'UPDATE medico SET estado = false WHERE id_medico = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Médico no encontrado' });
        }

        res.json({ mensaje: 'Médico desactivado correctamente' });
    } catch (error) {
        console.error('Error al eliminar médico:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

module.exports = {
    listarMedicos,
    obtenerMedicoPorId,
    crearMedico,
    actualizarMedico,
    eliminarMedico
};