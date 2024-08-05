import express from "express";
import HttpError from "../models/http-error.js";

const Dummy_Places = [
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

const router = express.Router();

router.get("/", (req, res, next) => {
    console.log("Get request in places");
    res.json({message : "it works"});
})

router.get("/:pid", (req, res, next) => {
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
})



export default router;