const { upcomings } = require("../models");
var express = require("express");
var router = express.Router();

const db = require("../models"); // models path depend on your structure
const Movie = db.movies;
var Sequelize = require("sequelize");
const Op = Sequelize.Op;



// Retrieve all Movies
router.get("/", (req, res) => {
    const title = req.query.title;
    var condition = title ? {
            title: {
                [Op.like]: `%${title}%`,
            },
        } :
        null;

    upcomings
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