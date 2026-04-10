    import prisma from '../lib/db.js';

    export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
    };

    export const createUser = async (req, res) => {
    const { email, name } = req.body;
    try {
        const newUser = await prisma.user.create({
        data: { email, name }
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: "El email ya existe o datos inválidos" });
    }
    };