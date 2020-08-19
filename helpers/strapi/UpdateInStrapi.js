const fs = require('fs');
const http = require('http');
const AuthStrapi = require('./AuthStrapi')

process.chdir(__dirname);

function PostDataToStrapi(targetname, token, dataToPost){
    dataToPost.forEach (dataObject =>{
        let options = {
            host: '139.59.130.149',
            path: targetname, //siia on vaja id-d kaasa anda
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
    })

};


//autoriseerib ja kutsub välja PostData, millele annab kaasa tokeni
AuthStrapi.Auth(PostData)

//Postdata kutsub välja PostDataToStrapi ja annab sellele kaasa tokeni
// lisaks tuleb talle anda info, mis objekti saadad (nt:'/countries') ja array saadetavatest objektidest
function PostData(token) {
    // //siin panen kokku objekti, mida strapisse kirjutada
    // let countryObjects = JSON.parse(fs.readFileSync('../ISOCountries.json', 'utf-8'))
    // PostDataToStrapi('/countries', token, countryObjects);

    // let langObjects = JSON.parse(fs.readFileSync('../data/ISOlanguages.json', 'utf-8'))
    // PostDataToStrapi('/languages', token, langObjects);

     let filmObjects = JSON.parse(fs.readFileSync('../data/Films.json', 'utf-8'))
     PostDataToStrapi('/films', token, filmObjects);
};


module.exports.POST = PostDataToStrapi

