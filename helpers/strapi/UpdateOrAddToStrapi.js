const fs = require('fs');
const http = require('http');
const AuthStrapi = require('./AuthStrapi')
const FromStrapi = require('./FromStrapi')

process.chdir(__dirname);

//see saadab ühe uue objekti Strapisse
function PostOneToStrapi
(path, token, dataObject){
    let options = {
        host: '139.59.130.149',
        path: path,
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
        host: '139.59.130.149',
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


//sellega saab Listi objektidest strapisse lisada, ise otsutab, kas peab lisama või muutma

// function UpdateOrAddCountry() {
//     let updateDataCB = function (token) {
//         let objectsToSEND = JSON.parse(fs.readFileSync('../data/ISOCountries.json', 'utf-8'))
//         let objectsInStrapi = JSON.parse(fs.readFileSync('../data/ISOCountriesFromStrapi.json', 'utf-8'))
//         let UpdateOrAddToStrapi = function(path, token, dataToSend, dataInStrapi){
//             dataToSend.forEach (dataObject =>{
//                 id = 'pole';
//                 //console.log('dataObejct:' + dataObject.code.toLowerCase())
//                 dataInStrapi.forEach(starpiObject => {
//                     //console.log(starpiObject.code.toLowerCase())
//                     if (starpiObject.code.toLowerCase() == dataObject.code.toLowerCase()){
//                         id = starpiObject.id;
//                         PutOneToStrapi (path, token, dataObject, id)
//                     }
//                 })
//                 if (id === 'pole'){
//                     console.log('seda pole strapis saadan kohe....')
//                     PostOneToStrapi
//                     (path, token, dataObject)
//                 }
//             })
//         };

//         UpdateOrAddToStrapi('/countries', token, objectsToSEND, objectsInStrapi);
//     }
//     FromStrapi.WriteJSON('/countries', '../data/ISOCountriesFromStrapi.json', updateDataCB)

// };

// UpdateOrAddCountry();

// UpdateOrAdd(dataToSend, datapath)


function ToStrapi(JSONdataToSend, dataFromStrapi, dataPath, strapiKeyToCompare, JSONdataToSendKey) {
    let updateDataCB = function (token) {
        let objectsToSEND = JSON.parse(fs.readFileSync(JSONdataToSend, 'utf-8'))
        let objectsInStrapi = JSON.parse(fs.readFileSync(dataFromStrapi, 'utf-8'))
        let UpdateOrAddToStrapi = function(path, token, dataToSend, dataInStrapi){
            dataToSend.forEach (dataObject =>{
                id = 'pole';
                //console.log('dataObejct:' + dataObject.code.toLowerCase())
                dataInStrapi.forEach(starpiObject => {
                    //console.log(starpiObject.code.toLowerCase())
                    if (starpiObject[strapiKeyToCompare].toLowerCase() == dataObject[JSONdataToSendKey].toLowerCase()){
                        id = starpiObject.id;
                        PutOneToStrapi (path, token, dataObject, id)
                    }
                })
                if (id === 'pole'){
                    console.log('seda pole strapis saadan kohe....')
                    PostOneToStrapi
                    (path, token, dataObject)
                }
            })
        };

        UpdateOrAddToStrapi(dataPath, token, objectsToSEND, objectsInStrapi);
    }
    FromStrapi.WriteJSON(dataPath, dataFromStrapi, updateDataCB)

};

// ToStrapi('../data/ISOCountries.json', '../data/ISOCountriesFromStrapi.json', '/countries', 'code', 'code');
// ToStrapi('../data/Films.json', '../data/test11.json', '/films', 'filmId', 'filmId');
ToStrapi('../data/ISOlanguages.json', '../data/test11.json', '/languages', 'code', 'code');

