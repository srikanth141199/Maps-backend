import {v4 as uuid} from "uuid";
import HttpError from "../models/http-error.js";
import { validationResult } from "express-validator";
import { userModel } from "../models/user.js";

export const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await userModel.find({}, '-password');
    } catch (error) {
        const err = new HttpError("Something went wrong while fetching user data", 500);
        return next(err);
    }
    res.status(200).json({ users : users.map(user => user.toObject({getters : true}))});
};

export const signup = async (req, res,next) => {

    const error = validationResult(req);

    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError("Invalid Input", 422));
    }
    const {name, email, password} = req.body;

    //const hadUser = Dummy_Users.find(user => user.email === email);
    let existingUser

    try {
        existingUser = await userModel.findOne({email : email});
    } catch (error) {
        const err = new HttpError("Something wrong while fetching the user", 500);
        return next(err);
    }

    // if(hadUser){
    //     throw new HttpError("User Already exists!!", 422);
    // }

    if(existingUser){
        const error = new HttpError("uSER EXISTS ALREADY", 422);
        return next(error);
    }

    // const newUser = {
    //     id : uuid(),
    //     name,
    //     email,
    //     password
    // }

    //Dummy_Users.push(newUser);

    const newUser = new userModel({
        name,
        email,
        image : "https://ih1.redbubble.net/image.5068742496.8109/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.jpg",
        password,
        places : []
    });

    try {
        await newUser.save();
    } catch (error) {
        const err = new HttpError("Some issue while SignUp!!", 500);
        return next(err);
    }
    res.status(201).json({user : newUser.toObject({getters : true})});
};

export const login = async (req, res, next) => {
    const {email, password} = req.body;

    let identifiedUser
    try {
        
        identifiedUser = await userModel.findOne({email : email});
    } catch (error) {
        const err = new HttpError("Something went wrong while Login!!", 500);
        return next(err);
    }

    if(!identifiedUser || identifiedUser.password !== password ){
        return next(new HttpError("Could not Identify User", 401));
    }

    res.status(200).json({message : "User Logged in!!"})
}