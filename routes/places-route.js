import express from "express";
import { createPlace, deletePlace, getPlacesByUserId, getPlacesById, updatePlace, getPlaces } from "../controllers/places-controller.js";
import { check } from "express-validator";



const router = express.Router();

router.get("/allPlaces", getPlaces)

router.get("/", (req, res, next) => {
    console.log("Get request in places");
    res.json({message : "it works"});
})

router.get("/:pid", getPlacesById)

router.get("/user/:uid", getPlacesByUserId);

router.post(
  "/",
  [
  check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
  check("address").not().isEmpty()
  ],
  createPlace
);

router.patch("/:pid",[
    check("title").not().isEmpty(),
    check("description").isLength({min : 5})
], updatePlace);
router.delete("/:pid", deletePlace);

export default router;