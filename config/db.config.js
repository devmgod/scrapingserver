module.exports = {
    HOST: "127.0.0.1",

    USER: "root",

    PASSWORD: "",

    DB: "scraping",

    dialect: "mysql",

    pool: {
        max: 11,

        min: 0,

        acquire: 60000,

        idle: 10000,
    },
};