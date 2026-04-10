const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
// Antes tenías: const prisma = new PrismaClient();
// Cámbialo por esto:

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors()); 
app.use(express.json()); 

// --- RUTAS ---

// 1. Verificar salud del servidor
app.get('/', (req, res) => {
    res.send('API de Campus Lago funcionando 🚀');
});

// 2. OBTENER todos los posts (GET)
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: { author: true }, 
            orderBy: { createdAt: 'desc' } 
        });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener publicaciones" });
    }
});

// 3. OBTENER un solo post por ID (GET)
app.get('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: { author: true }
        });
        if (!post) return res.status(404).json({ error: "Post no encontrado" });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el post" });
    }
});

// 4. CREAR un nuevo post (POST)
app.post('/api/posts', async (req, res) => {
    const { title, content, authorId } = req.body;
    
    // Validación básica
    if (!title || !authorId) {
        return res.status(400).json({ error: "Título y ID de autor son obligatorios" });
    }

    try {
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                authorId: Number(authorId) // Aseguramos que sea un número
            }
        });
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo crear el post. ¿Existe el autor?" });
    }
});

// 5. ACTUALIZAR un post (PUT)
app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    try {
        const updatedPost = await prisma.post.update({
            where: { id: Number(id) },
            data: { title, content }
        });
        res.json(updatedPost);
    } catch (error) {
        res.status(404).json({ error: "Post no encontrado o error al actualizar" });
    }
});

// 6. ELIMINAR un post (DELETE)
app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.post.delete({
            where: { id: Number(id) }
        });
        res.json({ message: "Post eliminado correctamente" });
    } catch (error) {
        res.status(404).json({ error: "No se pudo eliminar el post" });
    }
});

// --- MANEJO DE CIERRE ---
// Cerrar Prisma correctamente cuando el servidor se apaga
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

// Arrancar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});