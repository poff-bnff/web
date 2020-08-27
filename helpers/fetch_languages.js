const fs = require('fs');
const request = require('request');
const Fetcher = require('./fetch_spreadsheet_data');

// t88kataloogiks skripti kataloog
process.chdir(__dirname);

let spreadsheetId = '1rZaQfVqVgdnJRLHwp02deUoISndpprC8ZQtxfK6zK-E'
let range = 'ISOlanguages'
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

    let languagesTarget = JSON.stringify(target, null, 4);
    fs.writeFileSync('ISOlanguages.json', languagesTarget);

    target.forEach (language => {
        let request = require('request');
        options = {
        'method': 'POST',
        'url': 'http://'+ process.env['StrapiHost'] +'/languages',
        'headers': {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTk3MjQwODk2LCJleHAiOjE1OTk4MzI4OTZ9.KKt5IQQTx1KyHwQ_h3yCbcE9S_zi5x8ZvDqzcP87tN0',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(language)

        };
        request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });
    })
    console.log(language)
}

