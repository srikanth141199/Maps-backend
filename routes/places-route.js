import express from "express";
import HttpError from "../models/http-error.js";
import { createPlace, getPlaceByUserId, getPlacesById } from "../controllers/places-controller.js";



const router = express.Router();

router.get("/", (req, res, next) => {
    console.log("Get request in places");
    res.json({message : "it works"});
})

router.get("/:pid", getPlacesById)

router.get("/user/:uid", getPlaceByUserId);

router.post("/", createPlace);



export default router;