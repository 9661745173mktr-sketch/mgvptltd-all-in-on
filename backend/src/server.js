"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./auth"));
// @ts-ignore
const product_js_1 = __importDefault(require("./routes/product.js"));
s;
// @ts-ignore
const serviceController_1 = __importDefault(require("./serviceController"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api', product_js_1.default);
app.use('/api/services', serviceController_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
