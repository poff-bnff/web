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

const allLanguages = ["en", "et", "ru"];


var dirPath = `${sourceDir}_fetchdir/articles/`;

// getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
getData(dirPath, "en", 1, 1, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.en.yaml', 'articles': '/_fetchdir/articles.en.yaml'}, getDataCB);
getData(dirPath, "et", 0, 0, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.et.yaml', 'articles': '/_fetchdir/articles.et.yaml'}, getDataCB);
getData(dirPath, "ru", 0, 0, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.ru.yaml', 'articles': '/_fetchdir/articles.ru.yaml'}, getDataCB);


function getData(dirPath, lang, writeIndexFile, showErrors, dataFrom, getDataCB) {

    // fs.mkdirSync(dirPath, { recursive: true })

    console.log(`Fetching ${DOMAIN} articles ${lang} data`);

    getDataCB(STRAPIDATA_ARTICLE, dirPath, lang, writeIndexFile, dataFrom, showErrors);

}


function getDataCB(data, dirPath, lang, writeIndexFile, dataFrom, showErrors) {
    let allData = [];
    // data = rueten(data, lang);
    // console.log(data);
    data.forEach(element => {
        let slugEn = element.slug_en;
        if (!slugEn) {
            slugEn = element.slug_et;
        }

        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        element = rueten(element, lang);

        element.directory = dirPath + slugEn;

        if (element.directory) {
            for (key in element) {
                if (key == 'slug') {
                    element.path = `article/${element[key]}`;
                }
            }

            allData.push(element);
            element.data = dataFrom;

            let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
            fs.writeFileSync(path.join(fetchDir, `articles.${lang}.yaml`), allDataYAML, 'utf8');

        } else {
            if (showErrors) {
                console.log(`Film ID ${element.id} slug_en value missing`);
            }
        }
    });
}
