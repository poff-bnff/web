const fs = require('fs');
const http = require('http');
const AuthStrapi = require('./AuthStrapi')
const PostToStrapi = require('./PostToStrapi.js')
const Get = require('./FromStrapi')

process.chdir(__dirname);

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
function UpdateOrAddToStrapi(path, token, dataToSend, dataInStrapi){
    dataToSend.forEach (dataObject =>{
        id = 'pole';
        //console.log('dataObejct:' + dataObject.code.toLowerCase())
        dataInStrapi.forEach(starpiObject => {
            //console.log(starpiObject.code.toLowerCase())
            if (starpiObject.code.toLowerCase() == dataObject.code.toLowerCase()){
                id = starpiObject.id;
                PutOneToStrapi (path, token, dataObject, id)
            }
        })
        if (id === 'pole'){
            console.log('seda pole strapis saadan kohe....')
            PostToStrapi.POST(path, token, dataObject)
        }
    })
};



;
function UpdateOrAddCountry(token) {
    let objectsToSEND = JSON.parse(fs.readFileSync('../data/ISOCountries.json', 'utf-8'))
    Get.GetCountries()//aga see ei lõpeta enne kui järgmist rida alustatakse
    let objectsInStrapi = JSON.parse(fs.readFileSync('../data/ISOCountriesFromStrapi.json', 'utf-8'))
    UpdateOrAddToStrapi('/countries', token, objectsToSEND, objectsInStrapi);
};


AuthStrapi.Auth(UpdateOrAddCountry)


module.exports.ADDorUPDATE = UpdateOrAddToStrapi
