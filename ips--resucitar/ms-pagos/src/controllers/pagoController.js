const axios = require('axios');
const pool = require('../config/db');

const registrarPago = async (req, res) => {
    try {
        const { id_cita, monto, metodo_pago, referencia } = req.body;

        const metodosValidos = ['tarjeta', 'PSE', 'efectivo'];
        if (!id_cita || !monto || !metodo_pago) {
            return res.status(400).json({ mensaje: 'id_cita, monto y metodo_pago son obligatorios' });
        }
        if (!metodosValidos.includes(metodo_pago)) {
            return res.status(400).json({ mensaje: `metodo_pago debe ser uno de: ${metodosValidos.join(', ')}` });
        }

        // Verificar que la cita exista, consultando a ms-citas
        try {
            await axios.get(`${process.env.URL_CITAS}/citas/${id_cita}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(400).json({ mensaje: 'La cita indicada no existe' });
            }
            return res.status(503).json({ mensaje: 'No se pudo verificar la cita (servicio no disponible)' });
        }

        const [resultado] = await pool.query(
            `INSERT INTO pago (id_cita, monto, metodo_pago, referencia, estado)
             VALUES (?, ?, ?, ?, 'pendiente')`,
            [id_cita, monto, metodo_pago, referencia]
        );

        res.status(201).json({ mensaje: 'Pago registrado correctamente', id_pago: resultado.insertId });
    } catch (error) {
        console.error('Error al registrar pago:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const confirmarPago = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            "UPDATE pago SET estado = 'aprobado' WHERE id_pago = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Pago no encontrado' });
        }

        res.json({ mensaje: 'Pago confirmado correctamente' });
    } catch (error) {
        console.error('Error al confirmar pago:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const listarPagosPorCita = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM pago WHERE id_cita = ? ORDER BY fecha DESC',
            [id]
        );

        res.json(rows);
    } catch (error) {
        console.error('Error al listar pagos:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

module.exports = { registrarPago, confirmarPago, listarPagosPorCita };