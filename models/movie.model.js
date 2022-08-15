module.exports = (sequelize, Sequelize) => {
    const Movie = sequelize.define("movie", {
        poster: {
            type: Sequelize.STRING,
            unique: true
        },

        title: {
            type: Sequelize.STRING,
        },

        year: {
            type: Sequelize.STRING,
        },
        quality: {
            type: Sequelize.STRING,
        },

        video: {
            type: Sequelize.STRING,
        },
        filecode: {
            type: Sequelize.STRING,
        },
        iframurl: {
            type: Sequelize.STRING,
            unique: true
        },
    });

    return Movie;
};