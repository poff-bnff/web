const fs = require('fs');
const request = require('request');
const Fetcher = require('./fetch_spreadsheet_data');

// t88kataloogiks skripti kataloog
process.chdir(__dirname);

let spreadsheetId = '1tgM7Pgc1FzmNavWiZ_9uk3gJI97s0pkewVqHzqHo13c'
let range = 'ISOcountries'
Fetcher.Fetch(spreadsheetId, range, ProcessDataCB)

function ProcessDataCB(source){
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
    // console.log(target);

    let countriesTarget = JSON.stringify(target, null, 4);
    fs.writeFileSync('ISOCountries.json', countriesTarget);

    target.forEach (country => {
        let request = require('request');
        options = {
        'method': 'POST',
        'url': 'http://139.59.130.149/countries',
        'headers': {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTk3MjQwNDA2LCJleHAiOjE1OTk4MzI0MDZ9.ZddzcDSe7O130sr4dtxr2XOSP7j-BTmlOI8TGxWgKdM',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(country)

        };
        request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });
    })
    console.log(country)
}

