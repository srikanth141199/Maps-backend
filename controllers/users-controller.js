import HttpError from "../models/http-error.js";
import { validationResult } from "express-validator";
import { userModel } from "../models/user.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

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
        const error = new HttpError("USER EXISTS ALREADY, Please Login!!", 422);
        return next(error);
    }

    // const newUser = {
    //     id : uuid(),
    //     name,
    //     email,
    //     password
    // }

    //Dummy_Users.push(newUser);

    let hashedPassword;

    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
        const err = new HttpError("User can not be created", 500);
        return next(err);
    }

    const newUser = new userModel({
        name,
        email,
        image : req.file.path,
        password : hashedPassword,
        places : []
    });

    try {
        await newUser.save();
    } catch (error) {
        const err = new HttpError("Some issue while SignUp!!", 500);
        return next(err);
    }

    let token;

    try {
      token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
    } catch (error) {
      const err = new HttpError("Some issue while SignUp!!", 500);
      return next(err);
    }

    res
      .status(201)
      .json({
        userId: newUser.id,
        email: newUser.email,
        token: token,
      });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await userModel.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Something went wrong while Login!!", 500);
    return next(err);
  }

  if (!identifiedUser) {
    return next(new HttpError("Could not Identify User", 401));
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);    
  } catch (error) {
    const err = new HttpError("Sorry Password is wrong!!", 500);
    return next(err);
  }

  if (!isValidPassword) {
    const err = new HttpError("Password is wrong!!", 500);
    return next(err);
  }

  //JSON web token generation starts
  let token;

  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Some issue while Login!!", 500);
    return next(err);
  }

  res
    .status(200)
    .json({
      userId: identifiedUser.id,
      email: identifiedUser.email,
      token: token,
    });
}