import express from "express";
import bodyParser from "body-parser";

import PlacesRouters from "./routes/places-route.js";
import UserRouters from "./routes/users-route.js";


const app = express();

app.use(bodyParser.json());

app.use("/api/places",PlacesRouters);
app.use("/api/users", UserRouters);

app.use((error, req, res, next) => {
    if(res.headerSent){
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message : error.message || "An unknown error occurring" });
})

app.listen(5000, ()=>{
    console.log("app is listening in port 5000")
})