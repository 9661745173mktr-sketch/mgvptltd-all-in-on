"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Register Route
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const user = await prisma.user.create({
            data: {
                email,
                password,
                role: role || 'RETAILER'
            },
        });
        res.json({ message: 'Registration Successful', user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== password) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        res.json({ message: 'Login Successful', user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
