const fs = require('fs');
const AuthStrapi = require('./AuthStrapi')
const UpdateOrAddStrapi = require('./UpdateOrAddToStrapi')
const GetData = require('./FromStrapi')

process.chdir(__dirname);




function UpdateOrAddFilm(token) {
    //GetData.GET('/films', WriteFilmsDataToJSON, token)

    let objectsToSEND = JSON.parse(fs.readFileSync('../data/Films.json', 'utf-8'))
    let objectsInStrapi = JSON.parse(fs.readFileSync('../data/FilmsFromStrapi.json', 'utf-8'))

    UpdateOrAddStrapi.ADDorUPDATE('/films', token, objectsToSEND, objectsInStrapi);
};

AuthStrapi.Auth(UpdateOrAddFilm)

function WriteFilmsDataToJSON(strapiData){
    process.chdir(__dirname);
    console.log(strapiData);
    fs.writeFileSync('../data/FilmsTEST.json', JSON.stringify(strapiData, null, 4));
}
