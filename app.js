var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const bodyParser = require("body-parser");
var cors = require("cors");
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const fs = require("fs");
const request = require("request");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var movies = require("./routes/movie");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/movie", movies);

//mysql create
const db = require("./models");
db.sequelize.sync();

const datafetch = () => {
    //db
    const db_table = require("./models"); // models path depend on your structure

    const Tamil = db_table.tamils;
    const Featured = db_table.featureds;
    const Hindi = db_table.hindies;
    const Kannada = db_table.kannadas;
    const Malayalam = db_table.malayalams;
    const Telugu = db_table.telugues;
    const Upcoming = db_table.upcomings;

    //directory format
    const directory = "../tamilmovies/public/poster/";

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
            });
        }
    });

    // Featured.destroy({
    //     where: {},
    //     truncate: false,
    // });
    // Kannada.destroy({
    //     where: {},
    //     truncate: false,
    // });
    // Upcoming.destroy({
    //     where: {},
    //     truncate: false,
    // });
    // Malayalam.destroy({
    //     where: {},
    //     truncate: false,
    // });
    // Hindi.destroy({
    //     where: {},
    //     truncate: false,
    // });

    const videolink = {
        "https://www.tamilrockermovies.us/language/tamil/": "Tamil",
        "https://www.tamilrockermovies.us/featured/": "Featured",
        "https://www.tamilrockermovies.us/upcoming/": "Upcoming",
        "https://www.tamilrockermovies.us/language/kannada/": "Kannada",
        "https://www.tamilrockermovies.us/language/malayalam/": "Malayalam",
        "https://www.tamilrockermovies.us/language/telugu/": "Telugu",
    };

    Object.keys(videolink).map((key) => {
        //Scraping
        fetch(key)
            .then((res) => res.text())
            .then((text) => {
                const dom = new jsdom.JSDOM(text);
                const document = dom.window.document;

                //scrap function
                scrapingContent(document);

                //page number
                const allPage = document
                    .getElementsByTagName("nav")[2]
                    .getElementsByTagName("span")[0].innerHTML;

                const pageNum = allPage.split(" ")[3];

                for (let i = 2; i <= pageNum; i++) {
                    //node-fetch
                    const url_Num = key + "page/" + i + "/";
                    fetch(url_Num)
                        .then((res) => res.text())
                        .then((text) => {
                            const dom = new jsdom.JSDOM(text);
                            const document = dom.window.document;

                            //scrap function
                            scrapingContent(document);
                        });
                }
            });
        const scrapingContent = (document) => {
            const movieData = Array.from(document.getElementsByTagName("figure")).map(
                (e) => [
                    e.getElementsByTagName("a")[0].href,
                    // e.getElementsByTagName("div")[0].style.backgroundImage,
                ]
            );

            //sub data fetch
            movieData.map((val, index) => {
                fetch(val)
                    .then((res) => res.text())
                    .then((text) => {
                        // fs.writeFileSync("./test-sync.txt", text);
                        const dom = new jsdom.JSDOM(text);
                        const document = dom.window.document;
                        const poster = JSON.parse(
                            document.querySelectorAll("[type = 'application/ld+json']")[1]
                            .innerHTML
                        ).itemListElement[2].item.image;
                        const year = document
                            .getElementsByClassName("movie-info")[0]
                            .getElementsByTagName("a")[0].innerHTML;
                        const genres = document
                            .getElementsByClassName("movie-info")[0]
                            .getElementsByTagName("a")[1].innerHTML;
                        const country = document
                            .getElementsByClassName("movie-info")[0]
                            .getElementsByTagName("a")[2].innerHTML;
                        const language = document
                            .getElementsByClassName("movie-info")[0]
                            .getElementsByTagName("a")[3].innerHTML;
                        const runtime = document
                            .getElementsByClassName("movie-info")[0]
                            .getElementsByTagName("li")[1]
                            .innerHTML.split(":")[1];
                        const title = document
                            .getElementsByTagName("header")[1]
                            .getElementsByTagName("h1")[0].innerHTML;
                        const videourl = document
                            .getElementsByTagName("header")[3]
                            .getElementsByTagName("a")[0].href;

                        // download image
                        const url = poster;
                        const iName = poster.split("/");
                        const imgName = iName[iName.length - 1];

                        const path = "../tamilmovies/public/poster/" + imgName;
                        download(url, path, () => {
                            console.log("1 ✅ Done!");
                        });

                        const movieInfor = {
                            poster: imgName,
                            title: title,
                            year: year,
                            genres: genres,
                            country: country,
                            language: language,
                            runtime: runtime,
                            videourl: videourl,
                        };

                        switch (videolink[key]) {
                            case "Tamil":
                                Tamil.destroy({
                                    where: {},
                                    truncate: false,
                                });
                                Tamil.create(movieInfor);
                                break;
                            case "Featured":
                                Featured.destroy({
                                    where: {},
                                    truncate: false,
                                });
                                Featured.create(movieInfor);
                                break;
                            case "Upcoming":
                                Upcoming.destroy({
                                    where: {},
                                    truncate: false,
                                });
                                Upcoming.create(movieInfor);
                                break;
                            case "Kannada":
                                Kannada.destroy({
                                    where: {},
                                    truncate: false,
                                });
                                Kannada.create(movieInfor);
                                break;
                            case "Telugu":
                                Telugu.destroy({
                                    where: {},
                                    truncate: false,
                                });
                                Telugu.create(movieInfor);
                                break;
                            case "Malayalam":
                                Malayalam.destroy({
                                    where: {},
                                    truncate: false,
                                });
                                Malayalam.create(movieInfor);
                                break;
                            default:
                        }
                    });
            });
        };
        const download = (url, path, callback) => {
            request.head(url, (err, res, body) => {
                request(url).pipe(fs.createWriteStream(path)).on("close", callback);
            });
        };
    });
};

datafetch();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

process.on("uncaughtException", (error, origin) => {
    console.log("----- Uncaught exception -----");
    console.log(error);
    console.log("----- Exception origin -----");
    console.log(origin);
});

module.exports = app;