let fs = require('fs');

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
    console.log(target);
    let countriesTarget = JSON.stringify(target);
    fs.writeFile('ISOCountries.json', countriesTarget);
}

function createJSON(){


}
