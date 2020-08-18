const fs = require('fs');
const http = require('http');
const AuthStrapi = require('./AuthStrapi')
const Fetcher = require('./fetch_spreadsheet_data');

let postData =[{
    "code": "AD",
    "name_et": "Andorra",
    "name_en": "Andorra",
    "name_ru": "Андорра"
},
{
    "code": "AE",
    "name_et": "Araabia Ühendemiraadid",
    "name_en": "United Arab Emirates",
    "name_ru": "Объединенные Арабские Эмираты"
},
{
    "code": "KR",
    "name_et": "Lõuna-Korea",
    "name_en": "South Korea",
    "name_ru": "Республика Корея"
}]
let oneCountry ={
    "code": "KR",
    "name_et": "Lõuna-Korea",
    "name_en": "South Korea",
    "name_ru": "Республика Корея"
}

//targetname = countries, films jne,,,
function PostDataToStrapi(targetname, token){
    let options = {
        host: '139.59.130.149',
        path: targetname,
        method: 'POST',
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
            console.log(body.toString());
        });

        res.on("error", function (error) {
            console.error(error);
        });

    });
    console.log(token);
    console.log(JSON.stringify(oneCountry))
    req.write(JSON.stringify(oneCountry));

    req.end();

};

function PostData(token) {
    PostDataToStrapi('/countries', token);
};

AuthStrapi.Auth(PostData)
