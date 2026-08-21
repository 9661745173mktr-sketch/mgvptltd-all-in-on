"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 1. Get All Categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
// 2. Add a Category
router.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;
        const category = await prisma.category.create({ data: { name } });
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});
// 3. Get All Products
router.get('/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({ include: { categoryRef: true, vendor: true } });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
// 4. Add a Product
router.post('/products', async (req, res) => {
    try {
        const { name, description, price, imageUrl, categoryId, vendorId } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                title: name || 'Untitled',
                description,
                price: price ? parseFloat(price) : 0,
                imageUrl,
                categoryId: categoryId ? String(categoryId) : null,
                vendorId: vendorId || 'default-vendor-id'
            }
        });
        res.json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});
exports.default = router;
