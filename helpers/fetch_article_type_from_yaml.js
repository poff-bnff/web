const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const rootDir =  path.join(__dirname, '..')
const domainSpecificsPath = path.join(rootDir, 'domain_specifics.yaml')
const DOMAIN_SPECIFICS = yaml.safeLoad(fs.readFileSync(domainSpecificsPath, 'utf8'))

const sourceDir =  path.join(rootDir, 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))

const DOMAIN = process.env['DOMAIN'] || 'poff.ee'
const STRAPIDIR = '/uploads/'
const STRAPIHOSTWITHDIR = `http://${process.env['StrapiHost']}${STRAPIDIR}`;
const DEFAULTTEMPLATENAME = 'news'

// console.log(DOMAIN_SPECIFICS)
const mapping = DOMAIN_SPECIFICS.article
const modelName = mapping[DOMAIN]
const STRAPIDATA_ARTICLE = STRAPIDATA[modelName]
const languages = DOMAIN_SPECIFICS.locales[DOMAIN]
for (const lang of languages) {
    console.log(`Fetching ${DOMAIN} articles ${lang} data`)

    allData = [];
    const dirPath = path.join(sourceDir, "_fetchdir" )
    const dataFrom = {
        screenings: `/film/screenings.${lang}.yaml`,
        articles: `/_fetchdir/articles.${lang}.yaml`,
    }

    for (const strapiElement of STRAPIDATA_ARTICLE) {
        const element = JSON.parse(JSON.stringify(strapiElement))
        let slugEn = element.slug_en || element.slug_et
        if (!slugEn) {
            // console.log(element)
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
            continue;
        }
        if (publishUntil !== 'undefined' && publishUntil < currentTime) {
            continue;
        }
        if (element[`publish_${lang}`] === undefined || element[`publish_${lang}`] === false) {
            continue;
        }
        if (element[`title_${lang}`] < 1) {
            continue;
        }


        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.
        rueten(element, lang);

        //TODO #444
        if (element.contents && element.contents[0]) {
            let searchRegExp = new RegExp(STRAPIHOSTWITHDIR, 'g');
            let replaceWith = `/assets/img/dynamic/img_articles/${lang}/${element.slug}/`;
            const replaceImgPath = element.contents.replace(searchRegExp, replaceWith);
            element.contents = replaceImgPath;
        }

        // console.log(element)
        for (artType of element.article_types) {

            // console.log(dirPath, artType, slugEn)
            element.directory = path.join(dirPath, artType.name, slugEn)

            fs.mkdirSync(element.directory, { recursive: true });
            //let languageKeys = ['en', 'et', 'ru'];
            for (key in element) {

                if (key === "slug") {
                    element.path = path.join(artType.slug, element[key])
                    element.articleType = artType.label
                }
            }
            allData.push(element);
            element.data = dataFrom;

            let yamlStr = yaml.safeDump(element, { 'indent': '4' });

            fs.writeFileSync(`${element.directory}/data.${lang}.yaml`, yamlStr, 'utf8');
            if (fs.existsSync(`${sourceDir}/_templates/article_${artType.name}_index_template.pug`)) {
                fs.writeFileSync(`${element.directory}/index.pug`, `include /_templates/article_${artType.name}_index_template.pug`)
            } else {
                fs.writeFileSync(`${element.directory}/index.pug`, `include /_templates/article_${DEFAULTTEMPLATENAME}_index_template.pug`)
            }
        }
    }
}
