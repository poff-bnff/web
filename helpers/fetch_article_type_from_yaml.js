const fs = require('fs');
const yaml = require('js-yaml');
const { type } = require('os');
const path = require('path');
const rueten = require('./rueten.js')

const sourceFolder = path.join(__dirname, '../source/');
//console.log(sourceFolder)

// const allLanguages = ['en', 'et', 'ru'];

var dataModel = 'POFFiArticle'
if (process.env['DOMAIN'] === 'justfilm.ee') {
    dataModel = 'JustFilmiArticle'
} else if (process.env['DOMAIN'] === 'shorts.poff.ee') {
    dataModel = 'ShortsiArticle'
} else {
    process.env['DOMAIN'] = 'poff.ee'
}

let allData = []; // for articles view

function fetchAllData(dataModel) {
    let newDirPath = path.join(sourceFolder, "_fetchdir" )

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
        fs.readFileSync(__dirname + "/../source/_fetchdir/strapiData.yaml", "utf8")
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


function getDataCB(data, dirPath, lang, writeIndexFile, dataFrom, showErrors, generateYaml) {
    allData = [];
    data.forEach((element) => {
        let slugEn = element.slug_en || element.slug_et
        if (!slugEn) {
            throw new Error ("Artiklil on puudu nii eesti kui inglise keelne slug!", Error.ERR_MISSING_ARGS)
        }
        var currentTime = new Date()
        if (typeof(element.publishFrom) === 'undefined') {
            var publishFrom= new Date(element.created_at)
        } else {
            var publishFrom= new Date(element.publishFrom)
        }
        if (element.publishUntil) {
            var publishUntil = new Date(element.publishUntil)
        }
        if (currentTime < publishFrom) {
            return;
        }
        if (publishUntil !== 'undefined' && publishUntil < currentTime) {
            return;
        }
        if (element[`publish_${lang}`] === null || element[`publish_${lang}`] === false) {
            return;
        }
        if (element[`title_${lang}`] < 1) {
            return;
        }

        let doNotTouchTheTypes = [];
        if(element.article_types && element.article_types[0]) {
            for (let typeIndex = 0; typeIndex < element.article_types.length; typeIndex++) {
                const oneType = element.article_types[typeIndex];
                doNotTouchTheTypes.push(oneType);
            }
        }
        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        element = rueten(element, lang);
        element.article_types = doNotTouchTheTypes;

        for (artType of element.article_types) {
            element.directory = path.join(dirPath, artType.name, slugEn)
                fs.mkdirSync(element.directory, { recursive: true });
                for (key in element) {
                    if (key === "slug") {
                        element.path = path.join(artType[`slug_${lang}`], element[key])

                    }
                }

                allData.push(element);
                element.data = dataFrom;

                generateYaml(element, element, dirPath, lang, writeIndexFile, artType.name);
        }
    });
}


let allNews = [];
let allSponsor = [];
let allAbout = [];
let allInterview = [];
let allIndustry = [];

function generateYaml(element, element, dirPath, lang, writeIndexFile, artType){

    let yamlStr = yaml.safeDump(element, { 'indent': '4' });

    fs.writeFileSync(`${element.directory}/data.${lang}.yaml`, yamlStr, 'utf8');

    fs.writeFileSync(`${element.directory}/index.pug`, `include /_templates/article_${artType.toLowerCase()}_index_template.pug`, function(err) {
        if(err) {
            return console.log(err);
        }
    });

    let allDataYAML = yaml.safeDump(allData, { noRefs: true, indent: "4" });

    // if (artType === "News") {
    //     allNews.push(element);
    // } else if (artType === "SponsorStory") {
    //     allSponsor.push(element);
    // } else if (artType === "Interview") {
    //     allInterview.push(element);
    // } else if (artType === "About") {
    //     allAbout.push(element);
    // } else if (artType === "IndustryProject") {
    //     allIndustry.push(element);
    // }
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

fetchAllData(dataModel);
