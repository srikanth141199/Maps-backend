import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import PlacesRouters from "./routes/places-route.js";
import UserRouters from "./routes/users-route.js";
import HttpError from "./models/http-error.js";


const app = express();

app.use(bodyParser.json());

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
    if(res.headerSent){
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message : error.message || "An unknown error occurring" });
})

mongoose
  .connect("mongodb+srv://kolleparasrikanth:Srikanth5359$@ecomdb.ndaljpt.mongodb.net/mernMaps")
  .then(() => {
    app.listen(5000, () => {
      console.log("app is listening in port 5000");
    });
  })
  .catch(err => {
    console.log(err);
  });

