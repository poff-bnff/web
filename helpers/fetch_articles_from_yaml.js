const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const rueten = require('./rueten.js')

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'
const STRAPIDIR = '/uploads/'
const STRAPIHOSTWITHDIR = `http://${process.env['StrapiHost']}${STRAPIDIR}`;

const mapping = {
    'poff.ee': 'POFFiArticle',
    'justfilm.ee': 'JustFilmiArticle',
    'kinoff.poff.ee': 'KinoffiArticle',
    'industry.poff.ee': 'IndustryArticle',
    'shorts.poff.ee': 'ShortsiArticle'
}
const modelName = mapping[DOMAIN]
const STRAPIDATA_ARTICLE = STRAPIDATA[modelName]

const allLanguages = ["en", "et", "ru"]


var dirPath = `${sourceDir}_fetchdir/articles/`

// getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
getData(dirPath, "en", 1, 1, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.en.yaml', 'articles': '/_fetchdir/articles.en.yaml'})
getData(dirPath, "et", 0, 0, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.et.yaml', 'articles': '/_fetchdir/articles.et.yaml'})
getData(dirPath, "ru", 0, 0, {'pictures': '/article_pictures.yaml', 'screenings': '/film/screenings.ru.yaml', 'articles': '/_fetchdir/articles.ru.yaml'})


function getData(dirPath, lang, writeIndexFile, showErrors, dataFrom) {

    // fs.mkdirSync(dirPath, { recursive: true })

    console.log(`Fetching ${DOMAIN} articles ${lang} data`)

    let allData = []
    // data = rueten(data, lang)
    // console.log(data)
    for (const originalElement of STRAPIDATA_ARTICLE) {
        const element = JSON.parse(JSON.stringify(originalElement))
        let slugEn = element.slug_en
        if (!slugEn) {
            slugEn = element.slug_et
        }

        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        rueten(element, lang)

        element.directory = dirPath + slugEn

        if (element.directory) {
            for (key in element) {
                if (key == 'slug') {
                    element.path = `article/${element[key]}`
                }
            }

            if (element.contents && element.contents[0]) {
                var splitContent = element.contents.split(STRAPIHOSTWITHDIR);
                var i = 0;
                var contentImgs = [];
                while (splitContent[i+1]){
                    if(splitContent[i+1]) {
                        // console.log('IMG: ', splitContent[i+1].split(')')[0]);
                        contentImgs.push(splitContent[i+1].split(')')[0]);
                        i++;
                    }
                }
                let searchRegExp = new RegExp(STRAPIHOSTWITHDIR, 'g');
                let replaceWith = `/assets/img/dynamic/img_articles/${lang}/${element.slug}/`;
                const replaceImgPath = element.contents.replace(searchRegExp, replaceWith);
                element.contents = replaceImgPath;
                // console.log(contentImgs);
                element.contentsImg = contentImgs;
            }

            allData.push(element)
            element.data = dataFrom

            let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' })
            fs.writeFileSync(path.join(fetchDir, `articles.${lang}.yaml`), allDataYAML, 'utf8')

        } else {
            if (showErrors) {
                console.log(`Film ID ${element.id} slug_en value missing`)
            }
        }
    }
}
