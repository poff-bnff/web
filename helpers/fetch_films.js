const Fetcher = require('./fetch_spreadsheet_data');

// t88kataloogiks skripti kataloog
process.chdir(__dirname);

let spreadsheetId = '1J_cYJnZI41V8TGuOa8GVDjnHSD9qRmgKTJR3sd9Ff7Y'
let range = 'Filmid'
Fetcher.Fetch(spreadsheetId, range, ProcessDataCB)

function ProcessDataCB(data){
    console.log(data);
}

function createJSON(){


}
