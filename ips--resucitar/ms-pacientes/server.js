const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const pacienteRoutes = require('./src/routes/pacienteRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/pacientes', pacienteRoutes);

app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() AS fecha_servidor');
        res.json({ conexion: 'exitosa', fecha_servidor: rows[0].fecha_servidor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ conexion: 'fallida', error: error.message });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`ms-pacientes corriendo en http://localhost:${PORT}`);
});