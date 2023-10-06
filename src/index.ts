import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import { sequelize } from './db/dbConfig';
import User from './models/user';

dotenv.config();

class App {
    private readonly app: Express;

    constructor() {
        this.app = express();
        this.configureMiddleware();
        this.configureRoutes();
        this.startServer();
    }

    private configureMiddleware(): void {
        this.app.use(cors());
        this.app.use(express.json());
    }

    private configureRoutes(): void {
        this.app.post('/', async (req: Request, res: Response) => {
            try {
                const { username, email, password } = req.body;
                const encryptedPassword = await bcrypt.hash(password, 10);
                await User.create({
                    username,
                    email,
                    password: encryptedPassword,
                });
                return res.status(201).json({ message: 'Record Inserted successfully' });
            } catch (err) {
                console.log('ERROR : ', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }

    private startServer(): void {
        const PORT: string | undefined = process.env.PORT;
        if (PORT) {
            this.app.listen(PORT, async () => {
                try {
                    await sequelize.sync();
                    console.log('Database is Synchronized');
                } catch (err) {
                    console.log('Database is Not Synchronized');
                }

                console.log(`Server is Running on Port ${PORT}`);
            });
        } else {
            console.error('Port not defined in the environment variables.');
        }
    }
}

new App();
