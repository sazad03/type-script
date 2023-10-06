import express from 'express';
const route = express.Router();

route.post('/', signUp);
route.post('/login', login);

export default route;