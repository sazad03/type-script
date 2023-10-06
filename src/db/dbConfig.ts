import { Sequelize } from 'sequelize';
import dotenv from 'dotenv'

dotenv.config();
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;


export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'postgres',
    logging: false, 
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Database connection established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });
