import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import { sequelize } from './db/dbConfig';
import User from './models/user';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import jwt from 'jsonwebtoken';

dotenv.config();

class App {
    private readonly app: Express;
    constructor() {
        this.app = express();
        this.configureMiddleware();
        this.configureRoutes();
        this.startServer();
        this.swagger();
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

        this.app.post('/login', async (req: Request, res: Response) => {
            try {
                const { username, password } = req.body;
                const userDetails = await User.findOne({ where: { username } })
                const isPasswordMatched = await bcrypt.compare(password, userDetails?.dataValues.password);

                console.log(isPasswordMatched);
                if (isPasswordMatched){
                    const token = jwt.sign({data : userDetails?.dataValues.email}, 'SeretKey@123');
                    return res.status(200).json({ token })

                }

                return res.status(403).json({ error: 'Incorrect Password' })
            } catch (err) {
                console.log('ERR :: ', err);
                return res.status(500).json({ error: 'Internal Server Error' })
            }
        })

        this.app.get('/', this.middlewares, async (req: Request, res: Response) => {
            try {
                const userDetails = await User.findAll();
                return res.status(200).json({ message: userDetails })
            } catch (err) {
                console.log('ERR :: ', err);
                return res.status(500).json({ error: 'Internal Server Error' })
            }
        })
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

    private swagger(): void {
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

        const specs = swaggerJsDoc(options);
        this.app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
    }

    private async middlewares(req : Request, res : Response, next) : Response {
            try{
                const token = req.headers["authorization"]
               
                if(!token)
                    return res.status(403).json({error : 'Please provide valid JWT Token'})
                
                const parts = token.split(' ');
                const decodedToken = jwt.decode(parts[1] , 'SeretKey@123');
                const isUserExist = await User.findOne({where : {email : decodedToken.data}})
                
                if(!isUserExist)
                    return res.status(403).json({error : 'Unathorized User'})
        
                req.user = decodedToken;
                next();
            }catch(err){
                console.log('Something went wrong', err)
                return res.status(500).json({error : 'Something went wrong'})
            }
    }
}

new App();


