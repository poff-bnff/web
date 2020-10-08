const http = require('http');

function strapiQuery(options, dataObject = false) {
    console.log('Querying', options.method, options.path);
    return new Promise((resolve, reject) => {

        const request = http.request(options, (response) => {
            response.setEncoding('utf8');
            let allData = '';
            response.on('data', function (chunk) {
                allData += chunk;
            });
            response.on('end', function () {
                if (response.statusCode === 200) {
                    let strapiData = JSON.parse(allData);

                    resolve(strapiData);
                } else {
                    console.log('Status', response.statusCode);
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
exports.strapiQuery = strapiQuery;
