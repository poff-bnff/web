const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const sourceFolder =  path.join(__dirname, '../source/');

const allLanguages = ["en", "et", "ru"];

let allData = []; // for films view

var dataModel = 'Film';

function fetchAllData(dataModel){
    var dirPath = `${sourceFolder}_fetchdir/films/`;
    deleteFolderRecursive(dirPath);

    // getData(new directory path, language, copy file, show error when slug_en missing, files to load data from, connectionOptions, CallBackFunction)
    getData(dirPath, "en", 1, 1, {'pictures': '/film_pictures.yaml', 'screenings': '/film/screenings.en.yaml', 'articles': '/_fetchdir/articles.en.yaml'}, dataModel, getDataCB);
    getData(dirPath, "et", 0, 0, {'pictures': '/film_pictures.yaml', 'screenings': '/film/screenings.et.yaml', 'articles': '/_fetchdir/articles.et.yaml'}, dataModel, getDataCB);
    getData(dirPath, "ru", 0, 0, {'pictures': '/film_pictures.yaml', 'screenings': '/film/screenings.ru.yaml', 'articles': '/_fetchdir/articles.ru.yaml'}, dataModel, getDataCB);
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

function getData(dirPath, lang, copyFile, showErrors, dataFrom, dataModel, getDataCB) {

    fs.mkdirSync(dirPath, { recursive: true })

    console.log(`Fetching ${process.env['DOMAIN']} films ${lang} data`);

    allData = [];

    const data = yaml.safeLoad(fs.readFileSync(__dirname + '/../source/_fetchdir/strapiData.yaml', 'utf8'))

    getDataCB(data[dataModel], dirPath, lang, copyFile, dataFrom, showErrors, generateYaml);

}

function rueten(obj, lang) {
    const regex = new RegExp(`.*_${lang}$`, 'g');

    for (const key in obj) {
        // console.log(obj[key] + ' - ' + Array.isArray(obj[key]));
        if (obj.hasOwnProperty(key)) {
            const element = obj[key];
        }

        if (obj[key] === null) {
            delete obj[key];
            continue
        }
        else if (key === lang) {
            // console.log(key, obj[key]);
            return obj[key]
        } else if (key.match(regex) !== null) {
            // console.log(regex, key, key.match(regex));
            obj[key.substring(0, key.length-3)] = obj[key];
            delete obj[key];
        // } else if (Array.isArray(obj[key])) {
        //     obj[key].forEach(element => {
        //         element = rueten(element, lang)
        //     })
        } else if (typeof(obj[key]) === 'object') {
            obj[key] = rueten(obj[key], lang)
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
                    if (obj[key][i] === '') {
                        // console.log('EMPTY ONE');
                        obj[key].splice(i, 1);
                        i--;
                    }
                }
                if (obj[key].length === 0) {
                    delete obj[key];
                }
            }else{
                delete obj[key];
            }
        }
    }
    return obj
}


function getDataCB(data, dirPath, lang, copyFile, dataFrom, showErrors, generateYaml) {
    allData = [];
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

            generateYaml(element, element, dirPath, lang, copyFile)

        }else{
            if(showErrors) {
                console.log(`Film ID ${element.id} slug_en value missing`);
            }
        }
    });

}

function generateYaml(element, element, dirPath, lang, copyFile){
    let yamlStr = yaml.safeDump(element, { 'indent': '4' });

    // console.log(element.directory)

    fs.writeFileSync(`${element.directory}/data.${lang}.yaml`, yamlStr, 'utf8');
    // console.log(`WRITTEN: ${element.directory}/data.${lang}.yaml`);
    // console.log(element);
    if (copyFile) {
        fs.copyFile(`${sourceFolder}_templates/film_index_template.pug`, `${element.directory}/index.pug`, (err) => {
            if (err) throw err;
            // console.log(`File was copied to folder ${dirPath}${element.slug_en}`);
        })
    }

    let allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });

    fs.writeFileSync(`${sourceFolder}_fetchdir/films.${lang}.yaml`, allDataYAML, 'utf8');
}

function modifyData(element, key, lang){
    finalData = element[key][lang];
    delete element[key];
    element[key] = finalData;
}

fetchAllData(dataModel);

