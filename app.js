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

// var corsOptions = {
//     origin: "http://localhost:8081"
// };

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

//mysql
const db = require("./models");
db.sequelize.sync();

const datafetch = () => {
    //db
    const db_table = require("./models"); // models path depend on your structure
    const Movie = db_table.movies;
    const default_Url = "https://tamilgun.bio/video/";

    //database format
    Movie.destroy({
        where: {},
        truncate: false,
    });
    // .then((nums) => {
    //     res.send({ message: `${nums} Movies were deleted successfully!` });
    // })
    // .catch((err) => {
    //     res.status(500).send({
    //         message: err.message || "Some error occurred while removing all movies.",
    //     });
    // });

    //directory format
    const directory = "../tamilmovies/poster/";

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
            });
        }
    });
    fetch(default_Url)
        .then((res) => res.text())
        .then((text) => {
            const dom = new jsdom.JSDOM(text);
            const document = dom.window.document;

            const movieData = Array.from(
                document.getElementsByTagName("article")
            ).map((e) => [
                e.getElementsByTagName("a")[0].href,
                e.getElementsByTagName("img")[0].src,
                e.getElementsByTagName("a")[2].title,
                e.getElementsByTagName("a")[3].title,
                e.getElementsByTagName("time")[0].innerHTML,
            ]);

            //download image
            movieData.map((val, index) => {
                const url = val[1];
                const path = "../tamilmovies/public/poster/" + (index + 1) + ".jpg";
                download(url, path, () => {
                    console.log("1 ✅ Done!");
                });
                // Create a Movie
                const movie = {
                    poster: path,
                    title: val[3],
                    year: val[4],
                    quality: val[2],
                    video: val[0],
                };

                // Save Movie in the database
                Movie.create(movie);
                // .then((data) => {
                //     res.send(data);
                // })
                // .catch((err) => {
                //     res.status(500).send({
                //         message: err.message || "Some error occurred while creating the Movie.",
                //     });
                // });

                // const pp = document
                //     .getElementsByTagName("nav")[0]
                //     .getElementsByClassName("pages")[0]
                //     .innerHTML.split(" ")[3];
            });
        });

    for (let i = 2; i < 124; i++) {
        // console.log("----------================", Number(pageNum));
        //node-fetch
        url_Num = default_Url + "page/" + i + "/";
        fetch(url_Num)
            .then((res) => res.text())
            .then((text) => {
                const dom = new jsdom.JSDOM(text);
                const document = dom.window.document;

                const movieData = Array.from(
                    document.getElementsByTagName("article")
                ).map((e) => [
                    e.getElementsByTagName("a")[0].href,
                    e.getElementsByTagName("img")[0].src,
                    e.getElementsByTagName("a")[2].title,
                    e.getElementsByTagName("a")[3].title,
                    e.getElementsByTagName("time")[0].innerHTML,
                ]);
                // console.log("moviedata----------", movieData);

                //download image
                movieData.map((val, index) => {
                    const url = val[1];
                    const path = "../tamilmovies/public/poster/" + i + "-" + (index + 1) + ".jpg";
                    download(url, path, () => {
                        console.log("✅ Done!");
                    });
                    // Create a Movie
                    const movie = {
                        poster: path,
                        title: val[3],
                        year: val[4],
                        quality: val[2],
                        video: val[0],
                    };

                    // Save Movie in the database
                    Movie.create(movie);
                    // .then((data) => {
                    //     res.send(data);
                    // })
                    // .catch((err) => {
                    //     res.status(500).send({
                    //         message: err.message ||
                    //             "Some error occurred while creating the Movie.",
                    //     });
                    // });
                });
            });
    }

    const download = (url, path, callback) => {
        request.head(url, (err, res, body) => {
            request(url).pipe(fs.createWriteStream(path)).on("close", callback);
        });
    };
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