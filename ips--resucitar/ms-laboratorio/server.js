const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./src/config/db');
const resultadoRoutes = require('./src/routes/resultadoRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/resultados', resultadoRoutes);

app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT NOW() AS fecha_servidor');
        res.json({ conexion: 'exitosa', fecha_servidor: rows[0].fecha_servidor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ conexion: 'fallida', error: error.message });
    }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`ms-laboratorio corriendo en http://localhost:${PORT}`);
});