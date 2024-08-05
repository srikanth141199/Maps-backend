import express from "express";
import HttpError from "../models/http-error.js";
import { createPlace, deletePlace, getPlacesByUserId, getPlacesById, updatePlace } from "../controllers/places-controller.js";



const router = express.Router();

router.get("/", (req, res, next) => {
    console.log("Get request in places");
    res.json({message : "it works"});
})

router.get("/:pid", getPlacesById)

router.get("/user/:uid", getPlacesByUserId);

router.post("/", createPlace);

router.patch("/:pid", updatePlace);
router.delete("/:pid", deletePlace);

export default router;