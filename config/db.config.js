module.exports = {

    HOST: "127.0.0.1",

    USER: "root",

    PASSWORD: "",

    DB: "scraping",

    dialect: "mysql",

    pool: {

        max: 7,

        min: 0,

        acquire: 30000,

        idle: 10000

    }

};