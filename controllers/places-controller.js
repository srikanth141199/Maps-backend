import { validationResult } from "express-validator";
import HttpError from "../models/http-error.js";
import {v4 as uuidv4} from "uuid";
import { getCoordsForAddress } from "../util/location.js";
import { PlaceModal } from "../models/place.js";

let Dummy_Places = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'One of the most famous buildings in the world',
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Empire_State_Building_cropped.jpg",
        address: "20 W 34th St., New York, NY 10001, United States",
        location: {
            lat: 40.7484445,
            lng: -73.9905353
        },
        creator : 'u1'
    },
    {
        id: 'p2',
        title: 'Eiffel Tower',
        description: 'A wrought-iron lattice tower on the Champ de Mars in Paris, France',
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg",
        address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
        location: {
            lat: 48.8583701,
            lng: 2.2922926
        },
        creator : 'u2'
    },
    {
        id: 'p3',
        title: 'Colosseum',
        description: 'An ancient amphitheater in the center of Rome, Italy',
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Colosseo_2020.jpg",
        address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
        location: {
            lat: 41.8902102,
            lng: 12.4922309
        },
        creator : 'u3'
    },
    {
        id: 'p4',
        title: 'Great Wall of China',
        description: 'A series of fortifications made of various materials, located in northern China',
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/The_Great_Wall_of_China_at_Jinshanling-edit.jpg",
        address: "Huairou, China",
        location: {
            lat: 40.4319077,
            lng: 116.5703749
        },
        creator : 'u4'
    },
    {
        id: 'p5',
        title: 'Sydney Opera House',
        description: 'A multi-venue performing arts centre in Sydney, Australia',
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/82/Sydney_Opera_House_viewed_from_the_north.jpg",
        address: "Bennelong Point, Sydney NSW 2000, Australia",
        location: {
            lat: -33.8567844,
            lng: 151.2152967
        },
        creator : 'u5'
    }
];

export const getPlaces = (req, res, next) => {
    res.status(200).json({places : Dummy_Places});
}

export const getPlacesById = (req, res, next) => {
    const placeId = req.params.pid
    const place = Dummy_Places.find( place => place.id === placeId);

    if(!place){
        // res.status(404).json({message : "Could not provide place to given id"})
        // return;

        // const error = new Error("Could not provide place to given place id");
        // error.code = 404;
        // throw error;

        //3rd way of handling error

        throw new HttpError("Could not provide place to given place id", 404);
    }

    res.json({place});
};

export const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const places = Dummy_Places.filter(ele => ele.creator === userId);

    if(!places || places.length === 0){
        // res.status(404).json({message : "Could not provide place to given user id"})
        // return;

        // const error = new Error("Could not provide place to given user id");
        // error.code = 404;
        // return next(error);

        return next(new HttpError("Could not provide place to given user id", 404))
    }
    res.json({places})
}

export const createPlace = async (req, res, next) => {
    const error = validationResult(req);

    if(!error.isEmpty()){
        console.log(error);
        return next(new HttpError("Invalid Input", 422));
    }
     
    const {title, description, imageUrl, address, creator} = req.body;

    let coordinates;

    try {
        coordinates = await getCoordsForAddress(address);     
    } catch (error) {
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

    const createdPlace = new PlaceModal({
        title,
        description,
        address,
        location : coordinates,
        image : "https://upload.wikimedia.org/wikipedia/commons/8/8e/Empire_State_Building_cropped.jpg",
        creator
    })

    try {
        
        //Dummy_Places.push(createdPlace);
        await createdPlace.save();
    } catch (err) {
        const error = new HttpError("creating location failed", 500);
        return next(error);
    }

    res.status(201).json({place : createdPlace});
}

export const updatePlace = (req, res, next) => {

    const error = validationResult(req);

    if(!error.isEmpty()){
        console.log(error);
        throw new HttpError("Invalid Input", 422);
    }

    const {title, description} = req.body;
    const placeId = req.params.pid;

    const updatedPlace = {...Dummy_Places.find( place => place.id === placeId)};
    const placeIndex = Dummy_Places.findIndex(p => p.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;

    Dummy_Places[placeIndex] = updatedPlace;

    res.status(200).json({place : updatedPlace});
};

export const deletePlace = (req, res, next) => {
    const placeId = req.params.pid

    if(!Dummy_Places.find(place => place.id === placeId)){
        throw new HttpError("Could not find place for the given Id", 404);
    }
    Dummy_Places = Dummy_Places.filter(p => p.id !== placeId);

    res.status(200).json({message : "Deleted place."})
}