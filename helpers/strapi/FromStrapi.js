const fs = require('fs');
const http = require('http');
const AuthStrapi = require('./AuthStrapi');
const Validate= require('../compareStructure')
const yaml= require('js-yaml');

const datamodel = yaml.safeLoad(fs.readFileSync('../docs/datamodel.yaml', 'utf8'))
const DOMAIN = 'poff.ee'

function FromStrapi(modelName, CBfunction){
    console.log('validate model', modelName)
    if (datamodel[modelName] === undefined){
        throw new Error('Model ' + modelName + ' not in data model.')
    }
    let dataPath = datamodel[modelName]['_path']

    let FetchData = function(token) {

        let checkDomain = function(element){
            // kui on domain, siis element['domains'] = [domain]
            if (element['domain']){
                element['domains'] = [element['domain']]
            }

            if (element['domains'] === undefined) {
                // console.log(3);
                return true
            }

            for(let ix in element['domains']){
                let el = element['domains'][ix]
                // console.log(ix, el)
                if (el['url'] === DOMAIN){
                    console.log('domain !');
                    return true
                }
            }

            return false
        }
        let GetDataFromStrapi = function(dataPath, token, CBfunction){
            let options = {
                //see võiks tulla muutujast
                host: process.env['StrapiHost'],
                // ?_limit=-1 see tagab, et strapi tagastab kogu data, mitte 100 esimest nagu on vaikimisi säte
                path: dataPath +'?_limit=-1',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token}
            }
            let req = http.request(options, function (response) {
                let allData = '';
                response.on('data', function (chunk) {
                    allData += chunk;
                });
                response.on('end', function () {
                    let strapiData = JSON.parse(allData)
                    if (!Array.isArray(strapiData)){
                        strapiData = [strapiData]
                    }

                    strapiData = strapiData.filter(checkDomain)
                    CBfunction(strapiData, token)
                    // console.log(strapiData);

                });
                response.on('error', function (error) {
                    console.log(error);
                });
            });
            req.on('error', function (error) {
                console.log(error);
            })
            req.end()
        };
        GetDataFromStrapi(dataPath, token, CBfunction);
    };
    AuthStrapi.Auth(FetchData)
}

function WriteToJson(dataPath, filePath, CBfunction){
    ValitateAndReturnData(dataPath, function WriteJSON (strapiData, token){
        fs.writeFileSync(filePath, JSON.stringify(strapiData, null, 4));
        CBfunction(token, dataPath);
    })
}

function ValitateAndReturnData(dataPath, CBfunction){
    FromStrapi(dataPath, function WriteJSON (strapiData, token){
        Validate.Validate(strapiData, dataPath)
        CBfunction(strapiData, token)
    })
}

//ValitateAndReturnData('Article', LogData)



// USAGE: tagastab CBfunktsioonile strapist saadud data ja võrdleb seda data mudeliga
// function LogData(strapiData, token){
//     console.log(strapiData);
// }
// ValitateAndReturnData('/articles', LogData)
// callback funktsioon saab kaasa strapiData ja tokeni
module.exports.ValidateAndFetch = ValitateAndReturnData

//USAGE: kirjutab strapist saadud data JSON faili ja võrdleb seda data mudeliga
// function LogProcess(token, dataPath){
//     console.log("updating " + dataPath.slice(1) + " from Strapi");
// }
// FromStrapi.WriteJSON('/countries', '../data/ISOCountriesFromStrapi.json', LogProcess)
module.exports.WriteJSON = WriteToJson





