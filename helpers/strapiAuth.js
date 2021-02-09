const https = require('https')


async function strapiAuth() {

    console.log('Suurte t', process.env['STRAPIHOSTPOFF2021'])
    console.log('See on test', process.env['TEST'])
    console.log('See on vana', process.env['FETCH_HOST'])
    console.log('See on u', process.env['FETCH_USER'])
    console.log('H', process.env['StrapiHostPoff2021'])
    console.log('U', process.env['StrapiUserName'])

    return new Promise((resolve, reject) => {
        const postData = {
            identifier: process.env['StrapiUserName'],
            password: process.env['StrapiPassword']
        }

        const options = {
            hostname: process.env['StrapiHostPoff2021'],
            path: '/auth/local',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        console.log(options);

        const request = https.request(options, (response) => {
            response.setEncoding('utf8')
            let tokenStr = ''
            response.on('data', function (chunk) {
                tokenStr += chunk
            })

            response.on('end', function () {
                tokenStr = JSON.parse(tokenStr)['jwt']
                resolve(tokenStr)
            })

            console.log(tokenStr);
        })

        request.on('error', reject)
        request.write(JSON.stringify(postData))
        request.end()
    })
}
exports.strapiAuth = strapiAuth
