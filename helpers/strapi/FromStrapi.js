const fs = require('fs');
const http = require('http');
const AuthStrapi = require('./AuthStrapi');


function FromStrapi(datapath, CBfunction){
    let FetchData = function(token) {
        let GetDataFromStrapi = function(datapath, token, CBfunction){
            let options = {
                //see võiks tulla muutujast
                host: '139.59.130.149',
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
        CBfunction(token, dataPath);
    })
}

// USAGE: näiteks nii
// function LogData(strapiData, token){
//     console.log(strapiData);
// }
// FromStrapi.Fetch('/languages', LogData)
// callback funktsioon saab kaasa strapiData ja tokeni
module.exports.Fetch = FromStrapi

//USAGE: näiteks nii
// function LogProcess(token, dataPath){
//     console.log("updating " + dataPath.slice(1) + " from Strapi");
// }
// FromStrapi.WriteJSON('/countries', '../data/ISOCountriesFromStrapi.json', LogProcess)
module.exports.WriteJSON = WriteToJson





