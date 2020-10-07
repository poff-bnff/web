const http = require('http');
const { error } = require('console');

//console.log(process.env['StrapiPassword']);
//console.log(process.env['StrapiUserName']);


function AuthStrapi (CBOptions, CBfunction){
    let options = {
        host: process.env['StrapiHost'],
        path: '/auth/local',
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    }
    let req = http.request(options, function(response) {
        let tokenStr = '';

        //another chunk of data has been received, so append it to `token`
        response.on('data', function (chunk) {
            tokenStr += chunk;
        });
        //the whole response has been received, so we just print it out here
        response.on('end', function () {
            let token = JSON.parse(tokenStr).jwt
            CBOptions['headers']['Authorization'] = 'Bearer ' + token
            CBfunction(CBOptions);
            //fetchAll(token)
        });

        response.on('error', function (error) {
            console.log(error);
        })
    })
    //sellega kirjutan midagi requesti bodysse
    req.write(JSON.stringify({
            "identifier": process.env['StrapiUserName'],
            "password": process.env['StrapiPassword']
        })
    )

    req.on('error', function (error) {
        console.log('e', error);
    })

    req.end()
}

// function fetchAll(token) {
//     console.log(token.jwt);
// }

// FetchFromStrapi(fetchAll);

module.exports.Auth = AuthStrapi

//MUJAL KASUTAMISEKS
// const AuthStrapi = require('./AuthStrapi')
// //kasutan saadud tokenit ja kutsun välja pärnigu funktsiooni
// function AuthAll(token) {
//     GetDataFromStrapi('/countries', WriteCountriesDataToJSON, token);

// }
// //autoriseerimine, annan kaasa callback funktsiooni ja saan vastu tokeni
// AuthStrapi.Auth(AuthAll)

