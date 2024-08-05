import {v4 as uuid} from "uuid";
import HttpError from "../models/http-error.js";
import { validationResult } from "express-validator";

const Dummy_Users = [
    {
        id : "u1",
        name : 'Srikanth',
        email : 'srikanth@king.com',
        password : 'testers'
    }
]

export const getUsers = (req, res, next) => {
    res.status(200).json({ users : Dummy_Users});
};

export const signup = (req, res,next) => {

    const error = validationResult(req);

    if(!error.isEmpty()){
        console.log(error);
        throw new HttpError("Invalid Input", 422);
    }
    const {name, email, password} = req.body;

    const hadUser = Dummy_Users.find(user => user.email === email);
    if(hadUser){
        throw new HttpError("User Already exists!!", 422);
    }

    const newUser = {
        id : uuid(),
        name,
        email,
        password
    }

    Dummy_Users.push(newUser);
    res.status(201).json({user : newUser});
};

export const login = (req, res, next) => {
    const {email, password} = req.body;

    const identifiedUser = Dummy_Users.find( user => user.email === email);

    if(!identifiedUser || identifiedUser.password !== password ){
        throw new HttpError("Could not Identify User", 401);
    }

    res.status(200).json({message : "User Logged in!!"})
}