const fs = require("fs");
const yaml = require("js-yaml");
const { type } = require("os");
const path = require("path");

const sourceFolder = path.join(__dirname, "../source/");
//console.log(sourceFolder)

const allLanguages = ["en", "et", "ru"];

if (process.env["DOMAIN"] === "justfilm.ee") {
    var dataModel = "JustFilmiArticle";
} else if (process.env["DOMAIN"] === "shorts.poff.ee") {
    var dataModel = "ShortsiArticle";
} else {
    var dataModel = "POFFiArticle";
}

let allData = []; // for articles view

function fetchAllData(dataModel) {
    let newDirPath = path.join(sourceFolder, "_fetchdir" )

    // deleteFolderRecursive(newsDirPath);

    // deleteFolderRecursive(dirPath);
    // deleteFolderRecursive(aboutDirPath);
    // deleteFolderRecursive(interviewDirPath);
    // deleteFolderRecursive(sponsorDirPath);
    // deleteFolderRecursive(industryDirPath);

    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData(newDirPath,"en",1,1,{
            pictures: "/article_pictures.yaml",
            screenings: "/film/screenings.en.yaml",
            articles: "/_fetchdir/articles.en.yaml",
        },
        dataModel,
        getDataCB
    );
    getData(
        newDirPath,
        "et",
        0,
        0,
        {
            pictures: "/article_pictures.yaml",
            screenings: "/film/screenings.et.yaml",
            articles: "/_fetchdir/articles.et.yaml",
        },
        dataModel,
        getDataCB
    );
    getData(
        newDirPath,
        "ru",
        0,
        0,
        {
            pictures: "/article_pictures.yaml",
            screenings: "/film/screenings.ru.yaml",
            articles: "/_fetchdir/articles.ru.yaml",
        },
        dataModel,
        getDataCB
    );
}

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

function getData(
    dirPath,
    lang,
    writeIndexFile,
    showErrors,
    dataFrom,
    dataModel,
    getDataCB
) {
    // fs.mkdirSync(dirPath, { recursive: true })
    // console.log(dirPath)

    console.log(`Fetching ${process.env["DOMAIN"]} articles ${lang} data`);

    allData = [];

    const data = yaml.safeLoad(
        fs.readFileSync(__dirname + "/../source/strapiData.yaml", "utf8")
    );

    getDataCB(
        data[dataModel],
        dirPath,
        lang,
        writeIndexFile,
        dataFrom,
        showErrors,
        generateYaml
    );
}

function rueten(obj, lang) {
    const regex = new RegExp(`.*_${lang}$`, "g");

    for (const key in obj) {
        // console.log(obj[key] + ' - ' + Array.isArray(obj[key]));
        if (obj.hasOwnProperty(key)) {
            const element = obj[key];
        }

        if (obj[key] === null) {
            delete obj[key];
            continue;
        }
        if (key === "article_types") {
            continue;
        } else if (key === lang) {
            // console.log(key, obj[key]);
            return obj[key];
        } else if (key.match(regex) !== null) {
            // console.log(regex, key, key.match(regex));
            obj[key.substring(0, key.length - 3)] = obj[key];
            if (key.substring(0, 7) !== "publish_") {
                delete obj[key];
            }
            // } else if (Array.isArray(obj[key])) {
            //     obj[key].forEach(element => {
            //         element = rueten(element, lang)
            //     })
        } else if (typeof obj[key] === "object") {
            obj[key] = rueten(obj[key], lang);
            // if (Array.isArray(obj[key])) {
            //     if (typeof(obj[key][0]) === 'string') {
            //         obj[key] = obj[key].join(', ');
            //     }
            // }
        }
        if (Array.isArray(obj[key])) {
            // console.log(key + ' len: ' + obj[key].length + ' entries: ' + obj[key].length);
            // console.log(JSON.stringify(obj[key]));
            if (obj[key].length > 0) {
                for (var i = 0; i < obj[key].length; i++) {
                    if (obj[key][i] === "") {
                        // console.log('EMPTY ONE');
                        obj[key].splice(i, 1);
                        i--;
                    }
                }
                if (obj[key].length === 0) {
                    delete obj[key];
                }
            } else {
                delete obj[key];
            }
        }
    }
    return obj;
}


function getDataCB(data, dirPath, lang, writeIndexFile, dataFrom, showErrors, generateYaml) {
    allData = [];
    data.forEach((element) => {
        let slugEn = element.slug_en || element.slug_et
        if (!slugEn) {
            throw new Error ("Artiklil on puudu nii eesti kui inglise keelne slug!", Error.ERR_MISSING_ARGS)
        }
        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        element = rueten(element, lang);

        for (artType of element.article_types) {

            element.directory = path.join(dirPath, artType.name, slugEn)



                fs.mkdirSync(element.directory, { recursive: true });
                //let languageKeys = ['en', 'et', 'ru'];
                for (key in element) {

                    if (key == "slug") {
                        //console.log(self.data.path)

                        element.path = path.join(artType[`slug_${lang}`], element[key])
                    }

                    if (typeof element[key] === "object" && element[key] != null) {
                        // makeCSV(element[key], element, lang);
                    }
                }
                allData.push(element);
                element.data = dataFrom;

                generateYaml(element, element, dirPath, lang, writeIndexFile, artType);

        }



    });
}

function makeCSV(obj, element, lang) {
    // console.log(obj);
    for (const [key, value] of Object.entries(obj)) {
        if (
            value &&
            value != "" &&
            !value.toString().includes("[object Object]")
        ) {
            element[`${key}CSV`] = value.toString();
        } else if (value && value != "") {
            // rueten(value, `_${lang}`);
            makeCSV(value, element, lang);
        }
        // console.log(`${key}: ${value}`);
    }
}

let allNews = [];
let allSponsor = [];
let allAbout = [];
let allInterview = [];
let allIndustry = [];

function generateYaml(element, element, dirPath, lang, writeIndexFile, artType){

    let yamlStr = yaml.safeDump(element, { 'indent': '4' });

    fs.writeFileSync(`${element.directory}/data.${lang}.yaml`, yamlStr, 'utf8');

    fs.writeFileSync(`${element.directory}/index.pug`, `include /_templates/article_${artType.name.toLowerCase()}_index_template.pug`, function(err) {
        if(err) {
            return console.log(err);
        }
    });

    let allDataYAML = yaml.safeDump(allData, { noRefs: true, indent: "4" });

    if (artType.name === "News") {
        allNews.push(element);
    } else if (artType.name === "SponsorStory") {
        allSponsor.push(element);
    } else if (artType.name === "Interview") {
        allInterview.push(element);
    } else if (artType.name === "About") {
        allAbout.push(element);
    } else if (artType.name === "IndustryProject") {
        allIndustry.push(element);
    }
    //console.log(allAbout)



    //console.log(allAbout)

    // let allNewsYAML = yaml.safeDump(allNews, { noRefs: true, indent: "4" });
    // let allSponsorYAML = yaml.safeDump(allSponsor, {noRefs: true, indent: "4",});
    // let allInterviewYAML = yaml.safeDump(allInterview, { noRefs: true, indent: "4",});
    // let allAboutYAML = yaml.safeDump(allAbout, { noRefs: true, indent: "4" });
    // let allIndustryYAML = yaml.safeDump(allIndustry, {noRefs: true, indent: "4",});

    // fs.writeFileSync(`${sourceFolder}_fetchdir/news.${lang}.yaml`, allNewsYAML, "utf8");
    // fs.writeFileSync( `${sourceFolder}_fetchdir/sponsorstories.${lang}.yaml`, allSponsorYAML, "utf8");
    // fs.writeFileSync(`${sourceFolder}_fetchdir/interviews.${lang}.yaml`, allInterviewYAML, "utf8");
    // fs.writeFileSync(`${sourceFolder}_fetchdir/about.${lang}.yaml`, allAboutYAML, "utf8");
    // fs.writeFileSync(`${sourceFolder}_fetchdir/industry.${lang}.yaml`, allIndustryYAML, "utf8");
}

function modifyData(element, key, lang) {
    finalData = element[key][lang];
    delete element[key];
    element[key] = finalData;
}

fetchAllData(dataModel);
