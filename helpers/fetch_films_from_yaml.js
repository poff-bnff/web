const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js')

const sourceDir =  path.join(__dirname, '..', 'source')
const fetchDir =  path.join(sourceDir, '_fetchdir')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const DOMAIN = process.env['DOMAIN'] || 'poff.ee'

const modelName = 'Film';
const STRAPIDATA_FILM = STRAPIDATA[modelName]

const allLanguages = ["en", "et", "ru"];


function fetchAllData(){
    const filmsPath = path.join(fetchDir, 'films')
    deleteFolderRecursive(filmsPath);

    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData(dirPath, "en", 1, 1, {'screenings': '/film/screenings.en.yaml', 'articles': '/_fetchdir/articles.en.yaml'}, dataModel, getDataCB);
    getData(dirPath, "et", 0, 0, {'screenings': '/film/screenings.et.yaml', 'articles': '/_fetchdir/articles.et.yaml'}, dataModel, getDataCB);
    getData(dirPath, "ru", 0, 0, {'screenings': '/film/screenings.ru.yaml', 'articles': '/_fetchdir/articles.ru.yaml'}, dataModel, getDataCB);
}

function deleteFolderRecursive(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
  };

function getData(dirPath, lang, copyFile, showErrors, dataFrom, getDataCB) {

    fs.mkdirSync(dirPath, { recursive: true })

    console.log(`Fetching ${DOMAIN} films ${lang} data`);

    getDataCB(STRAPIDATA_FILM, dirPath, lang, copyFile, dataFrom, showErrors, generateYaml);
}



function getDataCB(data, dirPath, lang, copyFile, dataFrom, showErrors, generateYaml) {
    let allData = []
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
        // console.log(element.directory);
        // element = rueten(element, `_${lang}`);

        if(element.directory) {
            fs.mkdirSync(element.directory, { recursive: true })

            // let element = JSON.parse(JSON.stringify(element));
            // let aliases = []
            let languageKeys = ['en', 'et', 'ru'];
            for (key in element) {
                let lastThree = key.substring(key.length - 3, key.length);
                let findHyphen = key.substring(key.length - 3, key.length - 2);
                // if (lastThree !== `_${lang}` && findHyphen === '_' && !allLanguages.includes(lastThree)) {
                //     if (key.substring(0, key.length - 3) == 'slug') {
                //         aliases.push(element[key]);
                //     }
                //     delete element[key];
                // }
                // if (lastThree === `_${lang}`) {
                if (key == 'slug') {
                    element.path = `film/${element[key]}`;
                }
                    // element[key.substring(0, key.length - 3)] = element[key];


                // delete element[key];
                // }

                // Make separate CSV with key

                if (typeof(element[key]) === 'object' && element[key] != null) {
                    // makeCSV(element[key], element, lang);
                }

            }



            // element.aliases = aliases;
            // rueten(element, `_${lang}`);
            allData.push(element);
            element.data = dataFrom;

            generateYaml(element, lang, copyFile, allData)

        } else {
            if(showErrors) {
                console.log(`Film ID ${element.id} slug_en value missing`);
            }
        }
    });
}

function generateYaml(element, lang, copyFile, allData){
    let yamlStr = yaml.safeDump(element, { 'indent': '4' });

    // console.log(element.directory)

    fs.writeFileSync(`${element.directory}/data.${lang}.yaml`, yamlStr, 'utf8');
    // console.log(`WRITTEN: ${element.directory}/data.${lang}.yaml`);
    // console.log(element);
    if (copyFile) {
        const templateSourcePath = path.join(sourceDir, '_templates', 'film_index_template.pug')
        const templateTargetPath = path.join(element.directory, 'index.pug')
        fs.copyFile(templateSourcePath, templateTargetPath, (err) => {
            if (err) throw err;
            // console.log(`File was copied to folder ${dirPath}${element.slug_en}`);
        })
    }

    let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });

    fs.writeFileSync(path.join(fetchDir, `films.${lang}.yaml`), allDataYAML, 'utf8')
}


fetchAllData();

