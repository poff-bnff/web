const fs = require('fs');
const request = require('request');
const Fetcher = require('./FromSheets');


// t88kataloogiks skripti kataloog
process.chdir(__dirname);

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

    // faili nimi võiks ka muutujana sisse tulla
    //see jupp võiks olla araldi funktsioonis
    console.log(target);
    let objectToWrite = JSON.stringify(target, null, 4);

    fs.writeFileSync('../data/ISOCountries.json', objectToWrite);
}



let spreadsheetId = '1tgM7Pgc1FzmNavWiZ_9uk3gJI97s0pkewVqHzqHo13c'
let range = 'ISOcountries'

Fetcher.Fetch(spreadsheetId, range, ProcessDataCB)

