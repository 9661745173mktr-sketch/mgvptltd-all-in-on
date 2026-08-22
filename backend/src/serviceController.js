"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serviceController = (req, res) => {
    res.json({
        success: true,
        message: 'Service processed successfully from backend!',
        txId: 'TXN-' + Math.floor(Math.random() * 1000000)
    });
};
exports.default = serviceController;
