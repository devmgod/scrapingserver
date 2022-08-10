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
const axios = require("axios");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var tamil = require("./routes/tamil");

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
app.use("/tamil", tamil);

//mysql create
const db = require("./models");
db.sequelize.sync();

//db
// const db_table = require("./models"); // models path depend on your structure
const { title } = require("process");

const {
    tamils,
    featureds,
    hindies,
    kannadas,
    malayalams,
    telugues,
    upcomings,
} = db;

const allDbs = [
    tamils,
    featureds,
    hindies,
    kannadas,
    malayalams,
    telugues,
    upcomings,
];

const videolink = {
    "https://www.tamilrockermovies.us/language/tamil/": tamils,
    "https://www.tamilrockermovies.us/featured/": featureds,
    "https://www.tamilrockermovies.us/upcoming/": upcomings,
    "https://www.tamilrockermovies.us/language/hindi/": hindies,
    "https://www.tamilrockermovies.us/language/kannada/": kannadas,
    "https://www.tamilrockermovies.us/language/malayalam/": malayalams,
    "https://www.tamilrockermovies.us/language/telugu/": telugues,
};

// const datafetch = () => {
//   //directory format
//   const directory = "../tamilmovies/public/poster/";

//   fs.readdir(directory, (err, files) => {
//     if (err) throw err;

//     for (const file of files) {
//       fs.unlink(path.join(directory, file), (err) => {
//         if (err) throw err;
//       });
//     }
//   });

//   allDbs.map((val) => {
//     val.destroy({
//       where: {},
//       truncate: false,
//     });
//   });

//   Object.keys(videolink).map((key) => {
//     //Scraping
//     fetch(key)
//       .then((res) => res.text())
//       .then((text) => {
//         const dom = new jsdom.JSDOM(text);
//         const document = dom.window.document;

//         //scrap function
//         scrapingContent(document);

//         //page number
//         const allPage = document
//           .getElementsByTagName("nav")[2]
//           .getElementsByTagName("span")[0].innerHTML;

//         const pageNum = allPage.split(" ")[3];

//         // all pages fetch
//         for (let i = 2; i <= pageNum; i++) {
//           //node-fetch
//           const url_Num = key + "page/" + i + "/";
//           fetch(url_Num)
//             .then((res) => res.text())
//             .then((text) => {
//               const dom = new jsdom.JSDOM(text);
//               const document = dom.window.document;

//               //scrap function
//               scrapingContent(document);
//             });
//         }
//       });
//     const scrapingContent = (document) => {
//       const movieData = Array.from(document.getElementsByTagName("figure")).map(
//         (e) => [
//           e.getElementsByTagName("a")[0].href,
//           // e.getElementsByTagName("div")[0].style.backgroundImage,
//         ]
//       );

//       //sub data fetch
//       movieData.map((val, index) => {
//         fetch(val)
//           .then((res) => res.text())
//           .then((text) => {
//             // fs.writeFileSync("./test-sync.txt", text);
//             const dom = new jsdom.JSDOM(text);
//             const document = dom.window.document;

//             const poster = JSON.parse(
//               document.querySelectorAll("[type = 'application/ld+json']")[1]
//                 .innerHTML
//             ).itemListElement[2].item.image;
//             const year = document
//               .getElementsByClassName("movie-info")[0]
//               .getElementsByTagName("a")[0].innerHTML;
//             const genres = document
//               .getElementsByClassName("movie-info")[0]
//               .getElementsByTagName("a")[1].innerHTML;
//             const country = document
//               .getElementsByClassName("movie-info")[0]
//               .getElementsByTagName("a")[2].innerHTML;
//             const language = document
//               .getElementsByClassName("movie-info")[0]
//               .getElementsByTagName("a")[3].innerHTML;
//             const runtime = document
//               .getElementsByClassName("movie-info")[0]
//               .getElementsByTagName("li")[1]
//               .innerHTML.split(":")[1];
//             const title = document
//               .getElementsByTagName("header")[1]
//               .getElementsByTagName("h1")[0].innerHTML;
//             const videourl = document
//               .getElementsByTagName("header")[3]
//               .getElementsByTagName("a")[0].href;

//             // download image
//             const url = poster;
//             const iName = poster.split("/");
//             const imgName = iName[iName.length - 1];

//             const path = "../tamilmovies/public/poster/" + imgName;
//             download(url, path, () => {
//               console.log("1 ✅ Done!");
//             });

//             const movieInfor = {
//               poster: imgName,
//               title: title.trim(),
//               year: year,
//               genres: genres,
//               country: country,
//               language: language,
//               runtime: runtime,
//               videourl: videourl,
//             };

//             //create db
//             allDbs.map((val) => {
//               if (videolink[key] == val) {
//                 val.create(movieInfor);
//               }
//             });
//           });
//       });
//     };
//     const download = (url, path, callback) => {
//       request.head(url, (err, res, body) => {
//         request(url).pipe(fs.createWriteStream(path)).on("close", callback);
//       });
//     };
//   });
// };

const doodApi = () => {
    allDbs.map(async(dbSpecific) => {
        const tbData = await dbSpecific.findAll({ where: null });
        tbData.map((val, index) => {
            // console.log(val.title);
            // axios
            //     .get(
            //         "https://doodapi.com/api/file/list?key=131197ck2gd3ei6kkw08j0&page=1&per_page=10000"
            //     )
            //     .then((res) => {
            //         res.data.result.files.map((list) => {
            //             if (val.filecode == list.file_code) {
            //                 console.log(
            //                     index,
            //                     `----------------------------`,
            //                     list.file_code,
            //                     list.download_url,
            //                     val.title,
            //                     val.videourl
            //                 );
            //                 // update file_code
            //                 const movieInfor = {
            //                     iframurl: list.download_url,
            //                 };
            //                 dbSpecific.update(movieInfor, {
            //                     where: { filecode: list.file_code, updatedAt: null, },
            //                 });
            //             }
            //         });
            //     })
            //     .catch((error) => {
            //         //   console.error(error);
            //     });

            axios
                .get(
                    "https://doodapi.com/api/urlupload/actions?key=131197ck2gd3ei6kkw08j0&clear_errors=yes"
                )
                .then((res) => {
                    console.log(`statusCode: ${res.data.msg}`);
                })
                .catch((error) => {
                    //   console.error(error);
                });
            axios
                .get(
                    "https://doodapi.com/api/urlupload/slots?key=131197ck2gd3ei6kkw08j0"
                )
                .then((res) => {
                    if (res.data.used_slots < 100) {
                        axios
                            .get(
                                "https://doodapi.com/api/upload/url?key=131197ck2gd3ei6kkw08j0&url=" +
                                val.videourl +
                                "&new_title=" +
                                val.title
                            )
                            .then((res) => {
                                console.log(`statusCode: ${res.status}`);

                                //update file_code
                                const movieInfor = {
                                    filecode: res.data.file_code,
                                };
                                dbSpecific.update(movieInfor, {
                                    where: { title: val.title },
                                });
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    } else if (res.data.used_slots >= 100) {
                        return;
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        });
    });
};

doodApi();

// datafetch();

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