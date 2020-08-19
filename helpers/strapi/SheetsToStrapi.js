const fs = require('fs');
const request = require('request');
const Fetcher = require('../GoogleSheets/FromSheets');
const AuthStrapi = require('./AuthStrapi')
const POSTtoStrapi = require('./ToStrapi')


AuthStrapi.Auth(PostData)

function PostData(token) {

    //siin panen kokku objekti, mida strapisse kirjutada
    //let dataObjects = JSON.parse(fs.readFileSync('../ISOCountries.json', 'utf-8'))

    let spreadsheetId = '1tgM7Pgc1FzmNavWiZ_9uk3gJI97s0pkewVqHzqHo13c'
    let range = 'ISOcountries'

    Fetcher.Fetch(spreadsheetId, range, ProcessDataCB)
        //console.log(dataObjects);

    function ProcessDataCB(source){
        process.chdir(__dirname);
        let headers = source.values[0];
        source.values.shift();
        console.log(headers);

        let target = new Array()
        source.values.forEach(element => {
            // console.log(element);
            let language_o = {}
            for (const [key, value] of Object.entries(headers)) {
                language_o[value] = element[key]
            };
            // headers.map(function(e, i) {
            //     language_o[e] = element[i]
            // });
            target.push(language_o);

        });
        console.log(target);
        POSTtoStrapi.POST('/countries', token, target);

        // let objectToWrite = JSON.stringify(target, null, 4);
        // fs.writeFileSync('ISOCountries.json', objectToWrite);
    }
};
