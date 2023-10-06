"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signUp = void 0;
const user_1 = __importDefault(require("../models/user"));
const signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const userObject = await user_1.default.create({
            username,
            email,
            password
        });
        console.log('USER OBJECT ::: ', userObject);
        return res.status(201).json({ message: 'Record Inserted successfully' });
    }
    catch (err) {
        console.log('ERROR : ', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.signUp = signUp;
const login = async (req, res) => {
    try {
    }
    catch (err) {
    }
};
exports.login = login;
