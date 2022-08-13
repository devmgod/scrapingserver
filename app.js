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
var hindi = require("./routes/hindi");
var kannada = require("./routes/kannada");
var malayalam = require("./routes/malayalam");
var telugu = require("./routes/telugu");
var upcoming = require("./routes/upcoming");
var featured = require("./routes/featured");

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
app.use("/tamil/", tamil);
app.use("/hindi/", hindi);
app.use("/kannada/", kannada);
app.use("/malayalam/", malayalam);
app.use("/telugu/", telugu);
app.use("/upcoming/", upcoming);
app.use("/featured/", featured);


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

const videolink = {
    "https://www.tamilrockermovies.us/language/tamil/": tamils,
    "https://www.tamilrockermovies.us/featured/": featureds,
    "https://www.tamilrockermovies.us/upcoming/": upcomings,
    "https://www.tamilrockermovies.us/language/hindi/": hindies,
    "https://www.tamilrockermovies.us/language/kannada/": kannadas,
    "https://www.tamilrockermovies.us/language/malayalam/": malayalams,
    "https://www.tamilrockermovies.us/language/telugu/": telugues,
};
const directory = "../tamilmovies/public/poster/";

// setInterval(() => { main() }, 3600000);

const main = async() => {
    // directory format

    Object.keys(videolink).forEach(async(key) => {
        //Scraping

        await dbMap(key);
        // await clearDood();
        // await scrapingmain(key);


    });
};

const scrapingmain = async(key) => {
    try {

        const document = await fetchFun(key);

        //scrap function
        await scrapingContent(document, key);

        //page number
        const allPage = document
            .getElementsByTagName("nav")[2]
            .getElementsByTagName("span")[0].innerHTML;

        const pageNum = allPage.split(" ")[3];


        // all pages fetch
        for (let i = 2; i <= pageNum; i++) {
            //node-fetch
            const url_Num = key + "page/" + i + "/";
            const document2 = await fetchFun(url_Num);

            //scrap function
            await scrapingContent(document2, key);
        }
    } catch (e) {}


}


const scrapingContent = async(document, key) => {
    const movieData = Array.from(document.getElementsByTagName("figure")).map(
        (e) => [
            e.getElementsByTagName("a")[0].href
        ]
    );
    const downloadUrls = new Set(); //unique value array
    //sub data fetch


    movieData.map(async(e, index) => {
        const document = await fetchFun(e)

        try {

            const poster =
                document.querySelectorAll(
                    "[type = 'application/ld+json']"
                )[1] &&
                JSON.parse(
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


            //create db
            const myDb = videolink[key];
            const tbData = await myDb.findAll({ where: null });
            const titles = tbData.map((e) => e.title);

            if (titles.includes(title.trim())) {
                return;
            } else {

                // download image
                const url = poster;
                const iName = poster.split("/");
                const imgName = iName[iName.length - 1];

                const path = directory + imgName;
                // const files = fs.readdirSync(directory);
                await new Promise((resolve) => {
                    if (downloadUrls.has(url)) {
                        resolve();
                        return;
                    }
                    download(url, path, () => {
                        console.log("1 ✅ Done!");
                        downloadUrls.add(url);
                        resolve();
                    });
                });

                const movieInfor = {
                    poster: imgName,
                    title: title.trim(),
                    year: year,
                    genres: genres,
                    country: country,
                    language: language,
                    runtime: runtime,
                    videourl: videourl,
                };
                console.log("not", title);
                await myDb.create(movieInfor);
            }

        } catch (e) {}
    });
};
const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
        request(url).pipe(fs.createWriteStream(path)).on("close", callback);
    });
};

const fetchFun = async(key) => {
    const res = await fetch(key)
    const text = await res.text()
    const dom = new jsdom.JSDOM(text);
    const document = dom.window.document;
    return document;
}

const dbMap = async(e) => {
    const tbData = await videolink[e].findAll({ where: null });
    tbData.map(async(val, index) => {
        try {
            console.log('lleeeeeeeeeeeeeeeeeeeee', val.poster)
            const tbData = await videolink[e].findAll({ where: null });
            const iframes = tbData.map((e) => e.iframurl);
            // if (iframes.includes(val.iframurl)) {
            //     videolink[e].destroy({
            //         where: { val: id },
            //       })
            //     return;
            // } 
            // updataIframe(e, val);
            // file_code(e, val)

        } catch (e) {

        }
    });

}

const updataIframe = (e, val) => {

    // console.log('===================', val.filecode)
    //iframe
    axios
        .get(
            "https://doodapi.com/api/file/list?key=131197ck2gd3ei6kkw08j0&page=1&per_page=10000"
        )
        .then((res) => {
            res.data.result.files.map((list) => {
                if (val.filecode == list.file_code) {
                    console.log(
                        index,
                        `----------------------------`,
                        list.file_code,
                        list.download_url,
                        val.title,
                        val.videourl
                    );
                    // update file_code
                    const movieInfor = {
                        iframurl: list.download_url,
                    };
                    videolink[e].update(movieInfor, {
                        where: { filecode: list.file_code },
                    });
                }
            });
        })
        .catch((error) => {
            //   console.error(error);
        });

}


const file_code = (e, val) => {
    //file_code
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
                        videolink[e].update(movieInfor, {
                            where: { title: val.title },
                        });
                    })
                    .catch((error) => {
                        // console.error(error);
                    });
            } else if (res.data.used_slots >= 100) {
                return;
            }
        })
        .catch((error) => {
            // console.error(error);
        });
}

const clearDood = () => {
    //clear doodstream
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

}

const doodApi = () => {
    Object.keys(videolink).forEach(async(dbSpecific) => {



    });

};

const db_dir_format = () => {
    // fs.readdir(directory, (err, files) => {
    //     if (err) throw err;

    //     for (const file of files) {
    //         fs.unlink(path.join(directory, file), (err) => {
    //             if (err) throw err;
    //         });
    //     }
    // });

    // allDbs.map((val) => {
    //   val.destroy({
    //     where: {},
    //     truncate: false,
    //   });
    // });
}


main();

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