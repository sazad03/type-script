"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dbConfig_1 = require("./db/dbConfig");
const user_1 = __importDefault(require("./models/user"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv.config();
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.configureMiddleware();
        this.configureRoutes();
        this.startServer();
        this.swagger();
    }
    configureMiddleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    }
    configureRoutes() {
        this.app.post('/', async (req, res) => {
            try {
                const { username, email, password } = req.body;
                const encryptedPassword = await bcrypt_1.default.hash(password, 10);
                await user_1.default.create({
                    username,
                    email,
                    password: encryptedPassword,
                });
                return res.status(201).json({ message: 'Record Inserted successfully' });
            }
            catch (err) {
                console.log('ERROR : ', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        this.app.post('/login', async (req, res) => {
            try {
                const { username, password } = req.body;
                const userDetails = await user_1.default.findOne({ where: { username } });
                const isPasswordMatched = await bcrypt_1.default.compare(password, userDetails?.dataValues.password);
                console.log(isPasswordMatched);
                if (isPasswordMatched) {
                    const token = jsonwebtoken_1.default.sign({ data: userDetails?.dataValues.email }, 'SeretKey@123');
                    return res.status(200).json({ token });
                }
                return res.status(403).json({ error: 'Incorrect Password' });
            }
            catch (err) {
                console.log('ERR :: ', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        this.app.get('/', this.middlewares, async (req, res) => {
            try {
                const userDetails = await user_1.default.findAll();
                return res.status(200).json({ message: userDetails });
            }
            catch (err) {
                console.log('ERR :: ', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    startServer() {
        const PORT = process.env.PORT;
        if (PORT) {
            this.app.listen(PORT, async () => {
                try {
                    await dbConfig_1.sequelize.sync();
                    console.log('Database is Synchronized');
                }
                catch (err) {
                    console.log('Database is Not Synchronized');
                }
                console.log(`Server is Running on Port ${PORT}`);
            });
        }
        else {
            console.error('Port not defined in the environment variables.');
        }
    }
    swagger() {
        const options = {
            definition: {
                openapi: "3.0.0",
                info: {
                    title: "Library API",
                    version: "1.0.0",
                    description: "A simple Express Library API",
                    termsOfService: "http://example.com/terms/",
                    contact: {
                        name: "API Support",
                        url: "http://www.exmaple.com/support",
                        email: "support@example.com",
                    },
                },
                servers: [
                    {
                        url: "http://localhost:4001",
                        description: "My API Documentation",
                    },
                ],
            },
            apis: ["./Routes/*.js"],
        };
        const specs = (0, swagger_jsdoc_1.default)(options);
        this.app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
    }
    async middlewares(req, res, next) {
        try {
            const token = req.headers["authorization"];
            const parts = token.split(' ');
            if (!token)
                return res.status(403).json({ error: 'Please provide valid JWT Token' });
            const decodedToken = jsonwebtoken_1.default.decode(parts[1], 'SeretKey@123');
            const isUserExist = await user_1.default.findOne({ where: { email: decodedToken.data } });
            if (!isUserExist)
                return res.status(403).json({ error: 'Unathorized User' });
            req.user = decodedToken;
            next();
        }
        catch (err) {
            console.log('Something went wrong', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }
    }
}
new App();
