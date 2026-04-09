const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite que tu frontend (Vercel) se conecte [cite: 21, 45]
app.use(express.json()); // Permite recibir datos en formato JSON [cite: 362]

// --- RUTAS DE PRUEBA ---

// 1. Endpoint para verificar que el servidor funciona
app.get('/', (req, res) => {
    res.send('API de Campus Lago funcionando 🚀');
});

// 2. Endpoint para obtener todos los posts (GET) [cite: 28, 309]
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: { author: true }, // Incluye datos del autor en el JSON [cite: 346]
            orderBy: { createdAt: 'desc' } // Los más recientes primero [cite: 211]
        });
        res.json(posts); // Envía el JSON al frontend [cite: 303, 362]
    } catch (error) {
        res.status(500).json({ error: "Error al obtener publicaciones" });
    }
});

// Arrancar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});