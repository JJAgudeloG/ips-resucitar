const bcrypt = require('bcrypt');

const loginPaciente = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ mensaje: 'correo y contrasena son obligatorios' });
        }

        const [rows] = await pool.query(
            'SELECT * FROM paciente WHERE correo = ? AND estado = true',
            [correo]
        );

        if (rows.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const paciente = rows[0];

        const contrasenaValida = await bcrypt.compare(contrasena, paciente.contrasena);

        if (!contrasenaValida) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id_paciente: paciente.id_paciente, correo: paciente.correo },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            paciente: {
                id_paciente: paciente.id_paciente,
                nombre: paciente.nombre,
                apellido: paciente.apellido,
                correo: paciente.correo
            }
        });
    } catch (error) {
        console.error('Error en login:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const pool = require('../config/db');

const registrarPaciente = async (req, res) => {
    try {
        const { nombre, apellido, documento, correo, telefono, contrasena } = req.body;

        if (!nombre || !apellido || !documento || !correo || !contrasena) {
            return res.status(400).json({
                mensaje: 'nombre, apellido, documento, correo y contrasena son obligatorios'
            });
        }

        const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

        const [resultado] = await pool.query(
            `INSERT INTO paciente (nombre, apellido, documento, correo, telefono, contrasena, estado)
             VALUES (?, ?, ?, ?, ?, ?, true)`,
            [nombre, apellido, documento, correo, telefono, contrasenaEncriptada]
        );

        res.status(201).json({
            mensaje: 'Paciente registrado correctamente',
            id_paciente: resultado.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'Ya existe un paciente con ese documento o correo' });
        }
        console.error('Error al registrar paciente:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const jwt = require('jsonwebtoken');

module.exports = { registrarPaciente, loginPaciente };