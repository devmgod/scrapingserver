// module.exports = (app) => {

//     const movies = require("../controllers/movie.controller.js");

//     var router = require("express").Router();

//     // Create a new Movie
//     router.post("/", movies.create);

//     // Retrieve all Movies
//     router.get("/", movies.findAll);

//     // Retrieve a single Movie with id
//     router.get("/:id", movies.findOne);

//     // Update a Movie with id
//     router.put("/:id", movies.update);

//     // Delete a Movie with id
//     router.delete("/:id", movies.delete);

//     // Create a new Movie
//     router.delete("/", movies.deleteAll);

//     app.use("/api/movie", router);
// };
// const movies = require("../controllers/movie.controller.js");

var express = require("express");
const { tamils, hindies, malayalams, featureds, kannadas, telugues, upcomings } = require("../models");
var router = express.Router();

const db = require("../models"); // models path depend on your structure
const Movie = db.movies;
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

// Create a new Movie
router.post("/", (req, res) => {
    // Validate request
    console.log("----------------------", req.body);
    if (!req.body.poster) {
        res.status(400).send({
            message: "Content can not be empty!",
        });
        return;
    }

    // Create a Movie
    const movie = {
        poster: req.body.poster,
        title: req.body.title,
        year: req.body.year,
        quality: req.body.quality,
        video: req.body.video,
    };

    // Save Movie in the database
    Movie.create(movie)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Movie.",
            });
        });
});

// Retrieve all Movies
router.get("/", (req, res) => {
    const title = req.query.title;
    var condition = title ? {
            title: {
                [Op.like]: `%${title}%`,
            },
        } :
        null;

    telugues
        .findAll({
            where: {
                iframurl: {
                    [Op.ne]: null,
                },
            },
        })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving movies.",
            });
        });
});

// Retrieve a single Movie with id
router.get("/:id", (req, res) => {
    const id = req.params.id;

    Movie.findByPk(id)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error retrieving Movie with id=" + id,
            });
        });
});

// Update a Movie with id
router.put("/:id", (req, res) => {
    const id = req.params.id;

    Movie.update(req.body, {
            where: { id: id },
        })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: "Movie was updated successfully.",
                });
            } else {
                res.send({
                    message: `Cannot update Movie with id=${id}. Maybe Movie was not found or req.body is empty!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error updating Movie with id=" + id,
            });
        });
});

// Delete a Movie with id
router.delete("/:id", (req, res) => {
    const id = req.params.id;

    Movie.destroy({
            where: { id: id },
        })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: "Movie was deleted successfully!",
                });
            } else {
                res.send({
                    message: `Cannot delete Movie with id=${id}. Maybe Movie was not found!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Could not delete Movie with id=" + id,
            });
        });
});

// Create a new Movie
router.delete("/", (req, res) => {
    Movie.destroy({
            where: {},
            truncate: false,
        })
        .then((nums) => {
            res.send({ message: `${nums} Movies were deleted successfully!` });
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all movies.",
            });
        });
});

module.exports = router;