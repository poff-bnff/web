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
    let dirPath = `${sourceFolder}_fetchdir/articles/`;
    let newDirPath = `${sourceFolder}_fetchdir/`;
    let aboutDirPath = `${sourceFolder}_fetchdir/abouts/`;
    let interviewDirPath = `${sourceFolder}_fetchdir/interviews/`;
    let sponsorDirPath = `${sourceFolder}_fetchdir/sponsorstories/`;
    let industryDirPath = `${sourceFolder}_fetchdir/industryprojects/`;

    // deleteFolderRecursive(dirPath);
    // deleteFolderRecursive(newsDirPath);
    // deleteFolderRecursive(aboutDirPath);
    // deleteFolderRecursive(interviewDirPath);
    // deleteFolderRecursive(sponsorDirPath);
    // deleteFolderRecursive(industryDirPath);

    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData(
        newDirPath,
        "en",
        1,
        1,
        {
            pictures: "/article_pictures.yaml",
            screenings: "/film/screenings.en.yaml",
            articles: "/articles.en.yaml",
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
            articles: "/articles.et.yaml",
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
            articles: "/articles.ru.yaml",
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
        let slugEn = element.slug_en;
        if (!slugEn) {
            slugEn = element.slug_et;
        }
        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        element = rueten(element, lang);

        for (artType of element.article_types) {
            if (artType.name === "About") {
                element.directory = dirPath + "about/" + slugEn;
                fs.mkdirSync(element.directory, { recursive: true });
            } else if (artType.name === "Uudis") {
                element.directory = dirPath + "news/" + slugEn;
                fs.mkdirSync(element.directory, { recursive: true });
            } else if (artType.name === "ToetajaLugu") {
                console.log(element.id);
                element.directory = dirPath + "sponsorstory/" + slugEn;
                fs.mkdirSync(element.directory, { recursive: true });
            } else if (artType.name === "Intervjuu") {
                element.directory = dirPath + "interview/" + slugEn;
                fs.mkdirSync(element.directory, { recursive: true });
            } else if (artType.name === "IndustryProjekt") {
                element.directory = dirPath + "industryproject/" + slugEn;
                fs.mkdirSync(element.directory, { recursive: true });
            }
        }

        if (element.directory) {
            //fs.mkdirSync(element.directory, { recursive: true });
            //let languageKeys = ['en', 'et', 'ru'];
            for (key in element) {
                //let lastThree = key.substring(key.length - 3, key.length);
                //let findHyphen = key.substring(key.length - 3, key.length - 2);
                if (key == "slug") {
                    element.path = `article/${element[key]}`;
                }

                if (typeof element[key] === "object" && element[key] != null) {
                    // makeCSV(element[key], element, lang);
                }
            }
            allData.push(element);
            element.data = dataFrom;

            generateYaml(element, element, dirPath, lang, writeIndexFile);
        } else {
            if (showErrors) {
                console.log(`Film ID ${element.id} slug_en value missing`);
            }
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

function generateYaml(element, element, dirPath, lang, writeIndexFile) {
    let yamlStr = yaml.safeDump(element, { indent: "4" });
    fs.writeFileSync(`${element.directory}/data.${lang}.yaml`, yamlStr, "utf8");

    for (let i = 0; i < element.article_types.length; i++) {
        // console.log(articleName)
        if (element.article_types[i].name === "About") {
            // console.log('jdsk')
            if (writeIndexFile) {
                if (
                    element.article_types &&
                    element.article_types != null &&
                    element.article_types[i] != null
                ) {
                    var templateName = element.article_types[
                        i
                    ].name.toLowerCase();
                }
                if (
                    (templateName &&
                        !fs.existsSync(
                            `${sourceFolder}_templates/article_${templateName}_index_template.pug`
                        )) ||
                    !templateName
                ) {
                    var templateName = "about";
                }
                fs.writeFileSync(
                    `${element.directory}/index.pug`,
                    `include /_templates/article_${templateName}_index_template.pug`,
                    function (err) {
                        if (err) {
                            return console.log(err);
                        }
                    }
                );
            }
        }
    }

    //console.log(` see on generate YAML-is${dirPath}`)
    //KAS IIN SAAN TEHA _fetchdir-i kaustad ja failid??
    //fs.mkdirSync(dirPath, { recursive: true })

    //console.log(allData)
    let allDataYAML = yaml.safeDump(allData, { noRefs: true, indent: "4" });
    let allNews = [];
    let allSponsor = [];
    let allAbout = [];
    let allInterview = [];
    let allIndustry = [];

    for (article of allData) {
        //console.log(article.article_types)
        for (artType of article.article_types) {
            //console.log(artType.name)
            if (artType.name === "Uudis") {
                allNews.push(article);
            } else if (artType.name === "ToetajaLugu") {
                allSponsor.push(article);
            } else if (artType.name === "Intervjuu") {
                allInterview.push(article);
            } else if (artType.name === "About") {
                allAbout.push(article);
            } else if (artType.name === "IndustryProjekt") {
                allIndustry.push(article);
            }
        }
    }

    let allNewsYAML = yaml.safeDump(allNews, { noRefs: true, indent: "4" });
    let allSponsorYAML = yaml.safeDump(allSponsor, {noRefs: true, indent: "4",});
    let allInterviewYAML = yaml.safeDump(allInterview, { noRefs: true, indent: "4",});
    let allAboutYAML = yaml.safeDump(allAbout, { noRefs: true, indent: "4" });
    let allIndustryYAML = yaml.safeDump(allIndustry, {noRefs: true, indent: "4",});

    fs.writeFileSync( `${sourceFolder}articles.${lang}.yaml`, allDataYAML, "utf8");
    fs.writeFileSync(`${sourceFolder}news.${lang}.yaml`, allNewsYAML, "utf8");
    fs.writeFileSync( `${sourceFolder}sponsorstories.${lang}.yaml`, allSponsorYAML, "utf8");
    fs.writeFileSync(`${sourceFolder}interviews.${lang}.yaml`, allInterviewYAML, "utf8");
    fs.writeFileSync(`${sourceFolder}about.${lang}.yaml`, allAboutYAML, "utf8");
    fs.writeFileSync(`${sourceFolder}industry.${lang}.yaml`, allIndustryYAML, "utf8");
}

function modifyData(element, key, lang) {
    finalData = element[key][lang];
    delete element[key];
    element[key] = finalData;
}

fetchAllData(dataModel);
