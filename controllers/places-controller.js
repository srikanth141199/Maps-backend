import { validationResult } from "express-validator";
import HttpError from "../models/http-error.js";
import { getCoordsForAddress } from "../util/location.js";
import { PlaceModal } from "../models/place.js";
import { userModel } from "../models/user.js";
import mongoose from "mongoose";
import fs from "fs";

export const getPlaces = async (req, res, next) => {

    const places = await PlaceModal.find();
    res.status(200).json({places : places});
}

export const getPlacesById = async (req, res, next) => {
    const placeId = req.params.pid

    let place;
    try {
        //const place = Dummy_Places.find( place => place.id === placeId);
        place = await PlaceModal.findById(placeId);
    } catch (error) {
        const err = new HttpError("Something went wrong while searching place", 500);
        return next(err);
    }

    if(!place){
        // res.status(404).json({message : "Could not provide place to given id"})
        // return;

        // const error = new Error("Could not provide place to given place id");
        // error.code = 404;
        // throw error;

        //3rd way of handling error

        const err =  new HttpError("Could not provide place to given place id", 404);
        return next(err);
    }

    res.json({place : place.toObject({getters : true})});
};

export const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    //let places;
    let usersWithPlaces
    try {
        //const places = Dummy_Places.filter(ele => ele.creator === userId);
        //places = await PlaceModal.find({creator : userId})
        usersWithPlaces = await userModel.findById(userId).populate("places");
        
    } catch (error) {
        const err = new HttpError("Something went wrong while fetching the data using user Id", 500);
        return next(err);
    }

    if(!usersWithPlaces || usersWithPlaces.places.length === 0){
        // res.status(404).json({message : "Could not provide place to given user id"})
        // return;

        // const error = new Error("Could not provide place to given user id");
        // error.code = 404;
        // return next(error);

        return next(new HttpError("Could not provide place to given user id", 404))
    }
    res.json({places : usersWithPlaces.places.map( place => place.toObject({getters : true}))})
}

export const createPlace = async (req, res, next) => {
    const error = validationResult(req);

    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError("Invalid Input", 422));
    }
     
    const {title, description, address} = req.body;

    let coordinates;

    try {
        coordinates = await getCoordsForAddress(address);     
    } catch (error) {
        console.log(error)
        return next(error);
    }

    // const createdPlace = {
    //     id: uuidv4(),
    //     title : title,
    //     description : description,
    //     location : coordinates,
    //     address : address,
    //     creator : creator
    // };

    console.log(coordinates);
    const createdPlace = new PlaceModal({
        title,
        description,
        address,
        location : coordinates,
        image : req.file.path,
        creator : req.userData.userId
    });

    let user;
    try {
        user = await userModel.findById(req.userData.userId);
    } catch (error) {
        const err = new HttpError("Something while creating place failed", 500);
        return next(err);
    }

    if(!user){
        const err = new HttpError("We could not find user for provided Id", 500);
        return next(err);
    }

    try {
        //Dummy_Places.push(createdPlace);
        //await createdPlace.save();
        const session = await mongoose.startSession();
        session.startTransaction();
        await createdPlace.save({session : session}); //creating new Place
        user.places.push(createdPlace);
        await user.save({session : session}); // adding the place to user places array
        await session.commitTransaction();
        session.endSession();
    } catch (err) {
        const error = new HttpError("creating location failed", 500);
        return next(error);
    }

    res.status(201).json({place : createdPlace});
}

export const updatePlace = async (req, res, next) => {

    const error = validationResult(req);

    if(!error.isEmpty()){
        console.log(error);
        throw new HttpError("Invalid Input", 422);
    }

    const {title, description} = req.body;
    const placeId = req.params.pid;

    let place;

    try {
        
       // updatedPlace = {...Dummy_Places.find( place => place.id === placeId)};
       //placeIndex = Dummy_Places.findIndex(p => p.id === placeId);

       place = await PlaceModal.findById(placeId);

    } catch (error) {
        const err = new HttpError("There is issue while updating the Place, Please try after sometime.", 500);
        return next(err);
    }

    if (place.creator.toString() !== req.userData.userId) {
      const err = new HttpError("You are not allowed to edit this Place", 401);
      return next(err);
    }

    place.title = title;
    place.description = description;

    //Dummy_Places[placeIndex] = updatedPlace;

    try {
        await place.save();
    } catch (error) {
        const err = new HttpError("There is issue while updating the Place, Please try after sometime.", 500);
        return next(err);
    }

    res.status(200).json({place : place.toObject({getters : true})});
};

export const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid

    // if(!Dummy_Places.find(place => place.id === placeId)){
    //     throw new HttpError("Could not find place for the given Id", 404);
    // }
    // Dummy_Places = Dummy_Places.filter(p => p.id !== placeId);
    let place;

    try {
        place = await PlaceModal.findById(placeId).populate("creator");
    } catch (error) {
        const err = new HttpError("Some issue while deleting the place while finding", 500);
        return next(err);
    }

    if(!place){
        const err = new HttpError("We could not find place with this id", 404);
        return next(err);
    }

    if(place.creator.id !== req.userData.userId){
        const err = new HttpError("You are not authorized to perform this action", 401);
        return next(err);
    }

    const imagePath = place.image;

    try {
        //await place.remove();
        const session = await mongoose.startSession();
        session.startTransaction();
        await place.deleteOne({session : session});
        place.creator.places.pull(place);
        await place.creator.save({session : session});
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        const err = new HttpError("Some issue while deleting the place", 500);
        return next(err);
    }

    fs.unlink(imagePath, (err )=> {
        console.log(err);        
    })

    res.status(200).json({message : "Deleted place."})
}