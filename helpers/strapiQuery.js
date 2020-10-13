const http = require('http')
const { strapiAuth } = require("./strapiAuth.js")
var TOKEN = ''

async function strapiQuery(options, dataObject = false) {
    if (TOKEN === '') {
        TOKEN = await strapiAuth() // TODO: setting global variable is no a good idea
        console.log(TOKEN);
    }
    options.headers['Authorization'] = `Bearer ${TOKEN}`
    options['host'] = process.env['StrapiHost']

    // console.log(options, JSON.stringify((dataObject) || ''));
    return new Promise((resolve, reject) => {
        process.stdout.write({GET:'?', PUT:'+', POST:'o', DELETE:'X'}[options.method])
        const request = http.request(options, (response) => {
            response.setEncoding('utf8');
            let allData = '';
            response.on('data', function (chunk) {
                allData += chunk;
            });
            response.on('end', function () {
                if (response.statusCode === 200) {
                    resolve(JSON.parse(allData));
                } else {
                    console.log('Status', response.statusCode, JSON.stringify((dataObject) || ''));
                    resolve([]);
                }
            });
            response.on('error', function (thisError) {
                console.log('E', thisError);
                reject(thisError);
            });
        });
        request.on('error', reject);
        if (dataObject) {
            request.write(JSON.stringify(dataObject));
        }

        request.end();
    });
}
exports.strapiQuery = strapiQuery
