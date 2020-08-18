const http = require('http');
const { error } = require('console');

//console.log(process.env['StrapiPassword']);
//console.log(process.env['StrapiUserName']);


function AuthStrapi (CBfunction){
let options = {
    host: '139.59.130.149',
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
            CBfunction(token);
            //fetchAll(token)
        });

        response.on('error', function (error) {
            console.log(error);
        })
    })
    //sellega kirjutan midagi requesti bodysse
    req.write(JSON.stringify({
            "identifier":process.env['StrapiUserName'],
            "password":process.env['StrapiPassword']
        })
    )

    req.on('error', function (error) {
        console.log(error);
    })

    req.end(function () {
    })
}

// function fetchAll(token) {
//     console.log(token.jwt);
// }

// FetchFromStrapi(fetchAll);

module.exports.Auth = AuthStrapi



