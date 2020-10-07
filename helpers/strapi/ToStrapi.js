const fs = require('fs');
const http = require('http');
const FromStrapi = require('./FromStrapi')



//see saadab ühe uue objekti Strapisse
function PostOneToStrapi
(dataPath, token, dataObject){
    let options = {
        host: process.env['StrapiHost'],
        path: dataPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
    };
    let req = http.request(options, function (res) {
        let chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            bodyAsString = body.toString()
            body = JSON.parse(body)
            if (body.message == 'ValidationError'){
                console.log(body.error, body.message, body.data);
                console.log(dataObject);
            }else{
                console.log('seda pole strapis saadan kohe....')
                console.log(bodyAsString);
            }
        });

        res.on("error", function (error) {
            console.error(error);

        });

    });
    //console.log(dataObject)
    req.write(JSON.stringify(dataObject));

    req.end();
}
 //Update data-t, mis on juba Strapis
function PutOneToStrapi (path, token, dataObject, id){
    let options = {
        host: process.env['StrapiHost'],
        path: path + '/' + id, //siia on vaja id-d kaasa anda
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
    };
    let req = http.request(options, function (res) {
        let chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            bodyAsString = body.toString()
            body = JSON.parse(body)
            if (body.message == 'ValidationError'){
                console.log(body.error, body.message, body.data);
                console.log(dataObject);
            }else{
                console.log('updating....')
                console.log(bodyAsString);
            }
        });

        res.on("error", function (error) {
            console.error(error);
        });

    });
    req.write(JSON.stringify(dataObject));

    req.end();

}

//USAGE ToStrapi('../data/ISOCountries.json', '../data/ISOCountriesFromStrapi.json', '/countries', 'code');
function ToStrapi(JSONdataToSend, strapiDataFile, dataPath, keysToCompareforId) {
    let updateDataCB = function (token) {
        let objectsToSEND = JSON.parse(fs.readFileSync(JSONdataToSend, 'utf-8'))
        let objectsInStrapi = JSON.parse(fs.readFileSync(strapiDataFile, 'utf-8'))
        let UpdateOrAddToStrapi = function(path, token, dataToSend, dataInStrapi){
            dataToSend.forEach (dataObject =>{
                id = 'pole';
                dataInStrapi.forEach(strapiObject => {
                    if (strapiObject[keysToCompareforId] == dataObject[keysToCompareforId]){
                        id = strapiObject.id;
                        PutOneToStrapi (path, token, dataObject, id)
                    }
                })
                if (id === 'pole'){
                    PostOneToStrapi(path, token, dataObject)
                }
            })
        };
        UpdateOrAddToStrapi(dataPath, token, objectsToSEND, objectsInStrapi);
    }
    FromStrapi.WriteJSON(dataPath, strapiDataFile, updateDataCB)
};



module.exports.ToStrapi = ToStrapi
module.exports.PutOneToStrapi = PutOneToStrapi
module.exports.PostOneToStrapi = PostOneToStrapi


// USAGE:
// ToStrapi('./data/Films.json', './data/test11.json', '/films', 'filmId');
