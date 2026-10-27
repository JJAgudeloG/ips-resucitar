const pool = require('../config/db');

const obtenerInformacion = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM informacion_institucional LIMIT 1');

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'No hay información institucional registrada' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener información institucional:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const actualizarInformacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, direccion, telefono, correo, horario_atencion, descripcion } = req.body;

        const [resultado] = await pool.query(
            `UPDATE informacion_institucional
             SET nombre = ?, direccion = ?, telefono = ?, correo = ?, horario_atencion = ?, descripcion = ?
             WHERE id_informacion = ?`,
            [nombre, direccion, telefono, correo, horario_atencion, descripcion, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'No se encontró información institucional con ese id' });
        }

        res.json({ mensaje: 'Información institucional actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar información institucional:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

module.exports = { obtenerInformacion, actualizarInformacion };