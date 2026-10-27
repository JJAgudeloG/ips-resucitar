const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const registrarAdmin = async (req, res) => {
    try {
        const { nombre, apellido, correo, contrasena, rol } = req.body;

        const rolesValidos = ['Administrador', 'Consultor'];
        if (!nombre || !apellido || !correo || !contrasena || !rol) {
            return res.status(400).json({ mensaje: 'nombre, apellido, correo, contrasena y rol son obligatorios' });
        }
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({ mensaje: `rol debe ser uno de: ${rolesValidos.join(', ')}` });
        }

        const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

        const [resultado] = await pool.query(
            `INSERT INTO usuario_administrativo (nombre, apellido, correo, contrasena, rol, estado)
             VALUES (?, ?, ?, ?, ?, true)`,
            [nombre, apellido, correo, contrasenaEncriptada, rol]
        );

        res.status(201).json({ mensaje: 'Usuario administrativo registrado correctamente', id_usuario: resultado.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'Ya existe un usuario administrativo con ese correo' });
        }
        console.error('Error al registrar admin:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ mensaje: 'correo y contrasena son obligatorios' });
        }

        const [rows] = await pool.query(
            'SELECT * FROM usuario_administrativo WHERE correo = ? AND estado = true',
            [correo]
        );

        if (rows.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const admin = rows[0];
        const contrasenaValida = await bcrypt.compare(contrasena, admin.contrasena);

        if (!contrasenaValida) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id_usuario: admin.id_usuario, correo: admin.correo, rol: admin.rol },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id_usuario: admin.id_usuario,
                nombre: admin.nombre,
                apellido: admin.apellido,
                correo: admin.correo,
                rol: admin.rol
            }
        });
    } catch (error) {
        console.error('Error en login admin:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

module.exports = { registrarAdmin, loginAdmin };