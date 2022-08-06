const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.movies = require("./movie.model.js")(sequelize, Sequelize);
db.tamils = require("./tamil.model.js")(sequelize, Sequelize);
db.featureds = require("./featured.model.js")(sequelize, Sequelize);
db.hindies = require("./hindi.model.js")(sequelize, Sequelize);
db.kannadas = require("./kannada.model.js")(sequelize, Sequelize);
db.malayalams = require("./malayalam.model.js")(sequelize, Sequelize);
db.telugues = require("./telugu.model.js")(sequelize, Sequelize);
db.upcomings = require("./upcoming.model.js")(sequelize, Sequelize);

module.exports = db;