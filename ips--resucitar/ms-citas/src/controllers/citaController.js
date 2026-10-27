const axios = require('axios');
const pool = require('../config/db');

const crearCita = async (req, res) => {
    try {
        const { id_paciente, id_medico, id_servicio, fecha, hora, observaciones } = req.body;

        if (!id_paciente || !id_medico || !id_servicio || !fecha || !hora) {
            return res.status(400).json({
                mensaje: 'id_paciente, id_medico, id_servicio, fecha y hora son obligatorios'
            });
        }

        // 1. Verificar que el médico exista, consultando a ms-medicos
        try {
            await axios.get(`${process.env.URL_MEDICOS}/medicos/${id_medico}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(400).json({ mensaje: 'El médico indicado no existe' });
            }
            return res.status(503).json({ mensaje: 'No se pudo verificar el médico (servicio no disponible)' });
        }

        // 2. Verificar que el servicio exista, consultando a ms-institucional
        try {
            await axios.get(`${process.env.URL_INSTITUCIONAL}/servicios/${id_servicio}`);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return res.status(400).json({ mensaje: 'El servicio indicado no existe' });
            }
            return res.status(503).json({ mensaje: 'No se pudo verificar el servicio (servicio no disponible)' });
        }

        // 3. Si ambos existen, crear la cita en la base de datos local de ms-citas
        const [resultado] = await pool.query(
            `INSERT INTO cita (id_paciente, id_medico, id_servicio, fecha, hora, estado, observaciones)
             VALUES (?, ?, ?, ?, ?, 'pendiente', ?)`,
            [id_paciente, id_medico, id_servicio, fecha, hora, observaciones]
        );

        res.status(201).json({ mensaje: 'Cita creada correctamente', id_cita: resultado.insertId });
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ mensaje: 'El paciente indicado no existe' });
        }
        console.error('Error al crear cita:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const cambiarEstadoCita = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observaciones } = req.body;

        const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'reprogramada', 'atendida'];
        if (!estado || !estadosValidos.includes(estado)) {
            return res.status(400).json({
                mensaje: `estado debe ser uno de: ${estadosValidos.join(', ')}`
            });
        }

        const [resultado] = await pool.query(
            'UPDATE cita SET estado = ?, observaciones = ? WHERE id_cita = ?',
            [estado, observaciones, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Cita no encontrada' });
        }

        res.json({ mensaje: `Cita actualizada a estado: ${estado}` });
    } catch (error) {
        console.error('Error al actualizar cita:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const listarCitasPorPaciente = async (req, res) => {
    try {
        const { id } = req.params;

        const [citas] = await pool.query(
            'SELECT * FROM cita WHERE id_paciente = ? ORDER BY fecha DESC, hora DESC',
            [id]
        );

        const citasCompletas = await Promise.all(
            citas.map(async (cita) => {
                let medico = null;
                let servicio = null;

                try {
                    const respMedico = await axios.get(`${process.env.URL_MEDICOS}/medicos/${cita.id_medico}`);
                    medico = respMedico.data;
                } catch (error) {
                    medico = { nombre: 'No disponible', apellido: '' };
                }

                try {
                    const respServicio = await axios.get(`${process.env.URL_INSTITUCIONAL}/servicios/${cita.id_servicio}`);
                    servicio = respServicio.data;
                } catch (error) {
                    servicio = { nombre: 'No disponible' };
                }

                return {
                    ...cita,
                    medico: `${medico.nombre} ${medico.apellido}`,
                    especialidad: medico.especialidad || null,
                    servicio: servicio.nombre
                };
            })
        );

        res.json(citasCompletas);
    } catch (error) {
        console.error('Error al listar citas:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const obtenerCitaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query('SELECT * FROM cita WHERE id_cita = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Cita no encontrada' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener cita:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

const listarTodasLasCitas = async (req, res) => {
    try {
        const [citas] = await pool.query('SELECT * FROM cita ORDER BY fecha DESC, hora DESC');

        const citasCompletas = await Promise.all(
            citas.map(async (cita) => {
                let medico = { nombre: 'No disponible', apellido: '' };
                let servicio = { nombre: 'No disponible' };
                let paciente = { nombre: 'No disponible', apellido: '' };

                try {
                    const respMedico = await axios.get(`${process.env.URL_MEDICOS}/medicos/${cita.id_medico}`);
                    medico = respMedico.data;
                } catch (error) { /* se mantiene el valor por defecto */ }

                try {
                    const respServicio = await axios.get(`${process.env.URL_INSTITUCIONAL}/servicios/${cita.id_servicio}`);
                    servicio = respServicio.data;
                } catch (error) { /* se mantiene el valor por defecto */ }

                try {
                    const respPaciente = await axios.get(`${process.env.URL_PACIENTES}/pacientes/${cita.id_paciente}`, {
                        headers: { Authorization: req.headers.authorization }
                    });
                    paciente = respPaciente.data;
                } catch (error) { /* se mantiene el valor por defecto */ }

                return {
                    ...cita,
                    medico: `${medico.nombre} ${medico.apellido}`,
                    servicio: servicio.nombre,
                    paciente: `${paciente.nombre} ${paciente.apellido}`
                };
            })
        );

        res.json(citasCompletas);
    } catch (error) {
        console.error('Error al listar todas las citas:', error.message);
        res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
    }
};

module.exports = { crearCita, cambiarEstadoCita, listarCitasPorPaciente, obtenerCitaPorId, listarTodasLasCitas };