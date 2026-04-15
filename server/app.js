const express = require('express');
const cors = require('cors');
require('dotenv').config();

const prisma = require('./src/lib/db');
const authRoutes = require('./src/routes/authRoutes');
const { verifyToken } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // En .env pon FRONTEND_URL=https://tu-app.vercel.app
}));
app.use(express.json());

// --- RUTAS ---

// Auth
app.use('/api/auth', authRoutes);

// 1. Verificar salud del servidor
app.get('/', (req, res) => {
    res.send('API de Campus Lago funcionando 🚀');
});

// 2. OBTENER todos los posts (GET)
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: { select: { id: true, name: true, role: true, avatarUrl: true } },
                _count: { select: { likes: true, comments: true } },
            },
            orderBy: { createdAt: 'desc' },
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

// 4. CREAR un nuevo post (POST) — requiere login
app.post('/api/posts', verifyToken, async (req, res) => {
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ error: "El contenido del post no puede estar vacío" });
    }

    try {
        const newPost = await prisma.post.create({
            data: {
                content,
                authorId: req.user.id,
                isAnonymous: req.user.role === 'ADMINISTRADOR', // Los avisos del admin son siempre anónimos
            }
        });
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo crear el post." });
    }
});

// 5. ACTUALIZAR un post (PUT) — requiere login
app.put('/api/posts/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        const post = await prisma.post.findUnique({ where: { id: Number(id) } });
        if (!post) return res.status(404).json({ error: "Post no encontrado" });
        if (post.authorId !== req.user.id) return res.status(403).json({ error: "No puedes editar este post" });

        const updatedPost = await prisma.post.update({
            where: { id: Number(id) },
            data: { content }
        });
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el post" });
    }
});

// 6. ELIMINAR un post (DELETE) — requiere login
app.delete('/api/posts/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const post = await prisma.post.findUnique({ where: { id: Number(id) } });
        if (!post) return res.status(404).json({ error: "Post no encontrado" });
        if (post.authorId !== req.user.id) return res.status(403).json({ error: "No puedes eliminar este post" });

        await prisma.post.delete({ where: { id: Number(id) } });
        res.json({ message: "Post eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "No se pudo eliminar el post" });
    }
});

// 7. TOGGLE LIKE en un post (POST) — requiere login
app.post('/api/posts/:id/like', verifyToken, async (req, res) => {
    const postId = Number(req.params.id);
    const userId = req.user.id;

    try {
        const existing = await prisma.like.findUnique({
            where: { postId_userId: { postId, userId } },
        });

        if (existing) {
            await prisma.like.delete({ where: { postId_userId: { postId, userId } } });
        } else {
            await prisma.like.create({ data: { postId, userId } });
        }

        const likeCount = await prisma.like.count({ where: { postId } });
        res.json({ liked: !existing, count: likeCount });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar el like.' });
    }
});

// 8. OBTENER perfil de un usuario por ID (GET) — requiere login
app.get('/api/users/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
                createdAt: true,
                posts: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true, content: true, createdAt: true, isAnonymous: true,
                        _count: { select: { likes: true, comments: true } },
                    },
                },
            },
        });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el perfil.' });
    }
});

// 9. CAMBIAR ROL DE USUARIO (PUT) — solo ADMINISTRADOR
app.put('/api/users/:id/role', verifyToken, async (req, res) => {
    if (req.user.role !== 'ADMINISTRADOR') {
        return res.status(403).json({ error: 'Solo los administradores pueden cambiar roles.' });
    }

    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['ALUMNO', 'PROFESOR', 'ADMINISTRADOR'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: `Rol inválido. Válidos: ${validRoles.join(', ')}` });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { role },
            select: { id: true, name: true, email: true, role: true },
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(404).json({ error: 'Usuario no encontrado.' });
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