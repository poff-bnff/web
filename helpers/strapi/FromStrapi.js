const fs = require('fs');
const http = require('http');
const AuthStrapi = require('./AuthStrapi');


function GetDataFromStrapi(targetname, callbackfunction, token){
    let options = {
        host: '139.59.130.149',
        path: targetname +'?_limit=-1',
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
            let data = JSON.parse(allData)
            callbackfunction(data)
            //console.log(data);
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


//RIIGID
function WriteCountriesDataToJSON(strapiData){
    process.chdir(__dirname);
    console.log(strapiData);
    fs.writeFileSync('../data/ISOCountriesFromStrapi.json', JSON.stringify(strapiData, null, 4));
}

function FetchCountriesData(token) {
    GetDataFromStrapi('/countries', WriteCountriesDataToJSON, token);
};

function UpdateCountriesFromStrapi( ){
    AuthStrapi.Auth(FetchCountriesData)
}

//KEELED

function WriteLangsDataToJSON(strapiData){
    process.chdir(__dirname);
    console.log(strapiData);
    fs.writeFileSync('../data/ISOLanguagesFromStrapi.json', JSON.stringify(strapiData, null, 4));
}

function FetchLangsData(token) {
    GetDataFromStrapi('/countries', WriteLangsDataToJSON, token);
};

function UpdateLangsFromStrapi(){
    AuthStrapi.Auth(FetchLangsData)
}


//FILMID
function WriteFilmsDataToJSON(strapiData){
    process.chdir(__dirname);
    console.log(strapiData);
    fs.writeFileSync('../data/FilmsFromStrapi.json', JSON.stringify(strapiData, null, 4));
}

function FetchFilmData(token) {
    GetDataFromStrapi('/films', WriteFilmsDataToJSON, token);
};

function UpdateFilmsFromStrapi(){
    AuthStrapi.Auth(FetchFilmData)
}

module.exports.GetFilms = UpdateFilmsFromStrapi
module.exports.GetCountries = UpdateCountriesFromStrapi
module.exports.GetLanguages = UpdateLangsFromStrapi

//moodulite importimiseks
//const Get = require('./strapi/FromStrapi')
//nende välja kutsumine teisest failist loob uue vastava JSON-i või kirjutab vana üle
// Get.GetFilms();
// Get.GetCountries();
// Get.GetLanguages();


