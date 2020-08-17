const fs = require('fs');
const request = require('request');

// get data from Strapi
function GetDataFromStrapi(targetname, callbackfunction){
    let options = {
        'method': 'GET',
        'url': 'http://139.59.130.149/' + targetname,
        'headers': {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTk3MzAxNjA3LCJleHAiOjE1OTk4OTM2MDd9.h4lJbXMuALxrbXa39Xkq5bqOEbC-lzln14RAlDxPWhI'
        }
    };

    request(options, function (error, response, callback) {
        if (error) throw new Error(error);
        callbackfunction(response.body);
    });
};




//siin teen midagi saadud dataga
function WriteCountriesDataToJSON(strapiData){
    process.chdir(__dirname);
    console.log(strapiData);
    fs.writeFileSync('ISOCountriesFromStrapi.json', JSON.stringify(JSON.parse(strapiData), null, 4));
}

// function WriteFilmsDataToJSON(strapiData){
//     process.chdir(__dirname);
//     console.log(strapiData);
//     fs.writeFileSync('FilmsFromStrapi.json', JSON.stringify(JSON.parse(strapiData), null, 4));
// }


GetDataFromStrapi('countries', WriteCountriesDataToJSON);
////GetDataFromStrapi('films', WriteFilmsDataToJSON);




