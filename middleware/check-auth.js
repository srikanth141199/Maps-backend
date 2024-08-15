import HttpError from "../models/http-error.js";
import jwt from "jsonwebtoken"

const checkAuth = (req, res, next) => {
    if(req.method === "OPTIONS"){
        return next();
    }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Issue with Token");
    };

    const decodedToken = jwt.verify(token, "BGX6HGtINpxNxvp");
    req.userData = {userId : decodedToken.userId};
    next();

  } catch (err) {
    const error = new HttpError("Issue with Token", 401);
    return next(error);
  }
};

export default checkAuth;
