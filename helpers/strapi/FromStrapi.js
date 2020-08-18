const fs = require('fs');
const http = require('http');
const AuthStrapi = require('./AuthStrapi');


function GetDataFromStrapi(targetname, callbackfunction, token){
    // let options = {
    //     'method': 'GET',
    //     'url': 'http://139.59.130.149/' + targetname,
    //     'headers': {
    //     'Authorization': 'Bearer ' + token
    //     }
    // };
    //
    let options = {
        host: '139.59.130.149',
        path: targetname +'?_limit=-1',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token}
    }

    // request(options, function (error, response, callback) {
    //     if (error) throw new Error(error);
    //     callbackfunction(response.body);
    // });
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


//siin teen midagi saadud dataga
function WriteCountriesDataToJSON(strapiData){
    process.chdir(__dirname);
    console.log(strapiData);
    fs.writeFileSync('ISOCountriesFromStrapi.json', JSON.stringify(strapiData, null, 4));
}

function ConsoleLogData(strapiData){
    console.log(strapiData);
}

//kasutan saadud tokenit ja kutsun välja pärnigu funktsiooni
function FetchData(token) {
    GetDataFromStrapi('/countries', WriteCountriesDataToJSON, token);
};
//autoriseerimine, annan kaasa callback funktsiooni ja saan vastu tokeni
AuthStrapi.Auth(FetchData)




