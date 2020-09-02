const fs = require('fs');
const http = require('http');
const AuthStrapi = require('./AuthStrapi');
const Validate = require('../compareStructure')
const yaml= require('js-yaml');

const DATAMODEL = yaml.safeLoad(fs.readFileSync('../docs/datamodel.yaml', 'utf8'))
const DOMAIN = 'poff.ee'

function FromStrapi(modelName, ValidateCB, AfterFetchCB){

    if (DATAMODEL[modelName] === undefined){
        throw new Error('Model ' + modelName + ' not in data model.')
    }
    if (! '_path' in DATAMODEL[modelName]) {
        throw new Error ('Missing _path in model')
    }
    let dataPath = DATAMODEL[modelName]['_path']

    let options = {
        //see võiks tulla muutujast
        host: process.env['StrapiHost'],
        // ?_limit=-1 see tagab, et strapi tagastab kogu data, mitte 100 esimest nagu on vaikimisi säte
        path: dataPath +'?_limit=-1',
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    }

    const Compare = function (lhs, rhs, path) {
        // console.log('<--', path)
        delete lhs._path
        if (Array.isArray(lhs)) {
            if (Array.isArray(rhs)) {
                for (const ix in rhs) {
                    Compare(lhs[0], rhs[ix], path + '[' + ix + ']')
                }
            } else {
                console.log('- Not an array:', path)
            }
        } else {
            for (const key in lhs) {
                let next_path = path + '.' + key
                if (rhs === null) {
                    console.log(next_path, 'is null in data')
                    return
                }
                const lh_element = lhs[key]
                if (key in rhs) {
                    // console.log(key)
                    if (lh_element !== null && typeof(lh_element) === 'object' ) {
                        Compare(lh_element, rhs[key], next_path)
                    }
                } else {
                    console.log('- Missing key:', next_path)
                }
            }
        }
        // console.log('-->', path)
    }

    let RefetchIfNeeded = function(modelName, strapiData, token, CBfunction) {
        if (DATAMODEL[modelName] === undefined){
            throw new Error('Model ' + modelName + ' not in data model.')
        }
        let dataModel = DATAMODEL[modelName]
        if (! '_path' in DATAMODEL[modelName]) {
            throw new Error ('Missing _path in model')
        }
        let dataPath = DATAMODEL[modelName]['_path']

        if ('_refetch' in dataModel && dataModel['_refetch'] === true) {
            if (! '_path' in dataModel) {
                throw new Error ('Missing _path in model')
            }
            fetchOne(dataPath, id, token)
        }

        ValidateCB(modelName, strapiData, AfterFetchCB)
    }

    let FetchData = function(options) {

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

                RefetchIfNeeded(modelName, strapiData, ValidateCB)
                // ValidateCB(modelName, strapiData, AfterFetchCB)  //  const Validate = function(modelName, strapiData, AfterFetchCB){
            });
            response.on('error', function (error) {
                console.log(error);
            });
        });
        req.on('error', function (error) {
            console.log(error);
        })
        req.end()
    }

    AuthStrapi.Auth(options, FetchData)
}


function ValitateAndReturnData(modelName, AfterFetchCB){
    // ValidateCB = function (modelName, strapiData, AfterFetchCB){
    //     Validate.Validate(modelName, strapiData, AfterFetchCB)
    // }
    FromStrapi(modelName, Validate.Validate, AfterFetchCB)
}


// USAGE: tagastab CBfunktsioonile strapist saadud data ja võrdleb seda data mudeliga
// function LogData(strapiData){
//     console.log(strapiData);
// }
// ValitateAndReturnData('Film', LogData)
// callback funktsioon saab kaasa strapiData ja tokeni
module.exports.Fetch = ValitateAndReturnData
