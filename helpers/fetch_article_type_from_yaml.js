const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'

const mapping = {
    'poff.ee': 'POFFiArticle',
    'justfilm.ee': 'JustFilmiArticle',
    'shorts.poff.ee': 'ShortsiArticle'
}
const modelName = mapping[DOMAIN]
const STRAPIDATA_ARTICLE = STRAPIDATA[modelName]


function fetchAllData() {
    let newDirPath = path.join(sourceDir, "_fetchdir" )

    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData(newDirPath,"en",1,1,{
            screenings: "/film/screenings.en.yaml",
            articles: "/_fetchdir/articles.en.yaml",
        },
        getDataCB
    );
    getData(
        newDirPath,
        "et",
        0,
        0,
        {
            screenings: "/film/screenings.et.yaml",
            articles: "/_fetchdir/articles.et.yaml",
        },
        getDataCB
    );
    getData(
        newDirPath,
        "ru",
        0,
        0,
        {
            screenings: "/film/screenings.ru.yaml",
            articles: "/_fetchdir/articles.ru.yaml",
        },
        getDataCB
    );
}

function getData(
    dirPath,
    lang,
    writeIndexFile,
    showErrors,
    dataFrom,
    getDataCB
) {
    // fs.mkdirSync(dirPath, { recursive: true })
    // console.log(dirPath)

    console.log(`Fetching ${DOMAIN} articles ${lang} data`)

    getDataCB(
        STRAPIDATA_ARTICLE,
        dirPath,
        lang,
        writeIndexFile,
        dataFrom,
        showErrors
    );
}


function getDataCB(data, dirPath, lang, writeIndexFile, dataFrom, showErrors, generateYaml) {
    allData = [];
    for (const strapiElement of data) {
        const element = JSON.parse(JSON.stringify(strapiElement))
        let slugEn = element.slug_en || element.slug_et
        if (!slugEn) {
            // console.log(element)
            throw new Error ("Artiklil on puudu nii eesti kui inglise keelne slug!", Error.ERR_MISSING_ARGS)
        }
        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        rueten(element, lang);
        // console.log(element)
        for (artType of element.article_types) {

            // console.log(dirPath, artType, slugEn)
            element.directory = path.join(dirPath, artType.name, slugEn)

            fs.mkdirSync(element.directory, { recursive: true });
            //let languageKeys = ['en', 'et', 'ru'];
            for (key in element) {

                if (key === "slug") {
                    element.path = path.join(artType.slug, element[key])
                }
            }
            allData.push(element);
            element.data = dataFrom;

            let yamlStr = yaml.safeDump(element, { 'indent': '4' });

            fs.writeFileSync(`${element.directory}/data.${lang}.yaml`, yamlStr, 'utf8');
            fs.writeFileSync(`${element.directory}/index.pug`, `include /_templates/article_${artType.name}_index_template.pug`)
        }
    }
}


fetchAllData();
