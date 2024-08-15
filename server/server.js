"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// add .env configuration
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000; // You can choose any port
app.get('/', (req, res) => {
    res.send('Hello from the Node.js backend!');
});
app.listen(port, () => {
    console.log(`Server is running on port number ${port}`);
});
