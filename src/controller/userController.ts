import {Request, Response} from 'express'
import User from '../models/user'

export const signUp = async(req : Request, res : Response) => {
    try{
        const {username, email, password} = req.body;
        const userObject = await User.create({
            username,
            email,
            password
        })

        console.log('USER OBJECT ::: ', userObject);
        return res.status(201).json({message : 'Record Inserted successfully'})
    }catch(err){
        console.log('ERROR : ', err);
        return res.status(500).json({error : 'Internal Server Error'})
    }
}

export const login = async(req : Request, res : Response) => {
    try{

    }catch(err){

    }
}