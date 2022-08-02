module.exports = (sequelize, Sequelize) => {

    const Movie = sequelize.define("movie", {

        poster: {

            type: Sequelize.STRING

        },

        title: {

            type: Sequelize.STRING

        },

        year: {

            type: Sequelize.STRING

        },
        quality: {

            type: Sequelize.STRING

        },

        video: {

            type: Sequelize.STRING

        }

    });


    return Movie;

};