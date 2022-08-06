module.exports = (sequelize, Sequelize) => {
    const Upcoming = sequelize.define("upcoming", {
        poster: {
            type: Sequelize.STRING,
        },

        title: {
            type: Sequelize.STRING,
        },

        year: {
            type: Sequelize.STRING,
        },
        runtime: {
            type: Sequelize.STRING,
        },

        genres: {
            type: Sequelize.STRING,
        },
        country: {
            type: Sequelize.STRING,
        },
        language: {
            type: Sequelize.STRING,
        },
    });

    return Upcoming;
};