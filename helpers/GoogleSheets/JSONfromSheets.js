const fs = require('fs');
const request = require('request');
const Fetcher = require('./FromSheets');


// t88kataloogiks skripti kataloog
process.chdir(__dirname);

function ProcessDataCB(source, CBfunction){
    process.chdir(__dirname);
    let headers = source.values[0];
    source.values.shift();
    console.log(headers);

    let target = new Array()
    source.values.forEach(element => {
        let language_o = {}
        for (const [key, value] of Object.entries(headers)) {
            language_o[value] = element[key]
        };
        target.push(language_o);
    });

    let objectToWrite = JSON.stringify(target, null, 4);
    CBfunction(objectToWrite)

    //fs.writeFileSync('../data/ISOLanguages.json', objectToWrite);
}



function WriteLangsJSON (sheetsData){
    ProcessDataCB(sheetsData, function WriteLangs(sheetsData){
        console.log(sheetsData);
        fs.writeFileSync('../data/ISOLanguages.json', sheetsData);
    });
}

function WriteCountriesJSON (sheetsData){
    ProcessDataCB(sheetsData, function WriteLangs(sheetsData){
        console.log(sheetsData);
        fs.writeFileSync('../data/ISOCountries.json', sheetsData);
    });
}


Fetcher.Fetch('1tgM7Pgc1FzmNavWiZ_9uk3gJI97s0pkewVqHzqHo13c', 'ISOcountries', WriteCountriesJSON)
Fetcher.Fetch('1rZaQfVqVgdnJRLHwp02deUoISndpprC8ZQtxfK6zK-E', 'ISOlanguages', WriteLangsJSON)

