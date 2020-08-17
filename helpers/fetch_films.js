const Fetcher = require('./fetch_spreadsheet_data');
const {google} = require('googleapis');

// t88kataloogiks skripti kataloog
process.chdir(__dirname);

Fetcher.Fetch(
    function FetchDataFromSheet(auth) {
        const sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.get({
          spreadsheetId: '1J_cYJnZI41V8TGuOa8GVDjnHSD9qRmgKTJR3sd9Ff7Y',
          range: 'Filmid',
        }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
          const rows = res.data.values;
          if (rows.length) {
          //   console.log('id, Filmid:');
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
              console.log(`${row[0]}, ${row[4]}`);
            });
          } else {
            console.log('No data found.');
          }
        });
    }
)
