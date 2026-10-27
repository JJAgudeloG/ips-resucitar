const pool = require('../config/db');

const obtenerPerfilPaciente = async (req, res) => {
    try {
        const { id } = req.params;

        // Un paciente solo puede ver su propio perfil
        if (parseInt(id) !== req.paciente.id_paciente) {
            return res.status(403).json({ mensaje: 'No tienes permiso para ver este perfil' });
        }

        const [rows] = await pool.query(
            'SELECT id_paciente, nombre, apellido, documento, correo, telefono, estado FROM paciente WHERE id_paciente = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const actualizarPerfilPaciente = async (req, res) => {
    try {
        const { id } = req.params;

        if (parseInt(id) !== req.paciente.id_paciente) {
            return res.status(403).json({ mensaje: 'No tienes permiso para editar este perfil' });
        }

        const { nombre, apellido, telefono } = req.body;

        const [resultado] = await pool.query(
            'UPDATE paciente SET nombre = ?, apellido = ?, telefono = ? WHERE id_paciente = ?',
            [nombre, apellido, telefono, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado' });
        }

        res.json({ mensaje: 'Perfil actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar perfil:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const buscarPacientePorDocumento = async (req, res) => {
    try {
        const { documento } = req.params;

        const [rows] = await pool.query(
            'SELECT id_paciente, nombre, apellido, documento, correo FROM paciente WHERE documento = ? AND estado = true',
            [documento]
        );

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al buscar paciente:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const verificarExistenciaPaciente = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT id_paciente FROM paciente WHERE id_paciente = ? AND estado = true',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Paciente no encontrado' });
        }

        res.json({ existe: true });
    } catch (error) {
        console.error('Error al verificar paciente:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

module.exports = { obtenerPerfilPaciente, actualizarPerfilPaciente, buscarPacientePorDocumento, verificarExistenciaPaciente };