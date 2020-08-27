const fs = require('fs');
const http = require('http');
const AuthStrapi = require('./AuthStrapi');


function FromStrapi(datapath, CBfunction){
    let FetchData = function(token) {
        let GetDataFromStrapi = function(datapath, token, CBfunction){
            let options = {
                //see võiks tulla muutujast
                host: process.env['StrapiHost'],
                // ?_limit=-1 see tagab, et strapi tagastab kogu data, mitte 100 esimest nagu on vaikimisi säte
                path: datapath +'?_limit=-1',
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
                    CBfunction(data, token)
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
        GetDataFromStrapi(datapath, token, CBfunction);
    };
    AuthStrapi.Auth(FetchData)
}

function WriteToJson(dataPath, filePath, CBfunction){
    FromStrapi(dataPath, function WriteJSON (strapiData, token){
        process.chdir(__dirname);
        fs.writeFileSync(filePath, JSON.stringify(strapiData, null, 4));
        CBfunction(token);
    })
}


// USAGE: pead defineerima, kasutad seda funktsiooni
// const FromStrapi = require('./strapi/FromStrapi')
// function ConsoleLogData(strapiData){
//     console.log(strapiData);
// }
// FromStrapi.Fetch('/languages', ConsoleLogData)

module.exports.Fetch = FromStrapi

// WriteToJson('/countries', '../data/Test88.json', updateDataCB);
module.exports.WriteJSON = WriteToJson





