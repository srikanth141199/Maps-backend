import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import PlacesRouters from "./routes/places-route.js";
import UserRouters from "./routes/users-route.js";
import HttpError from "./models/http-error.js";
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
})

app.use("/api/places",PlacesRouters);
app.use("/api/users", UserRouters);

app.use((req, res, next) => {
    const error = new HttpError("Could not find this route", 404);
    throw error;
})

app.use((error, req, res, next) => {
  if(req.file){
    fs.unlink(req.file.path, (err) =>{console.log(err);
    });
  }
    if(res.headerSent){
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message : error.message || "An unknown error occurring" });
})

mongoose
  .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ecomdb.ndaljpt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
  .then(() => {
    app.listen(5000, () => {
      console.log("App is listening on port 5000");
    });
  })
  .catch(err => {
    console.log(err);
  });


