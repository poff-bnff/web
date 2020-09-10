const http = require('http')
const util = require('util')


async function strapiAuth() {

    var postData = {
        identifier: 'test',
        password: 'test123'
    }

    var options = {
        hostname: '139.59.130.149',
        path: '/auth/local',
        method: 'POST',
        headers: {
           'Content-Type': 'application/json'
        }
    }

    return new Promise((resolve, reject) => {
        const request = http.request(options, response => {

            let tokenStr = ''

            response.on('data', function (chunk) {
                tokenStr += chunk
            })

            response.on('end', function () {
                resolve(tokenStr)
            })

        })

        request.on('error', reject)
        request.write(JSON.stringify(postData))
        request.end()
    })
}

const foo = async () => {
    const token = await strapiAuth()
    console.log(token)
}

foo()
