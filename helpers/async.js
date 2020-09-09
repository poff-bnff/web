const util = require('util')
const fetch = require("node-fetch");

async function strapi_auth() {
    let options = {
        host: process.env['StrapiHost'],
        path: '/auth/local',
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
    }

    let url = 'http://' + options.host + options.path
    console.log(url);
    const response = await fetch(url)
    const json = await response.json()
    console.log(util.inspect(json))
    return json
}



let options = {
    modelName: 'POFFiMenu',
    host: process.env['StrapiHost'],
    path: '/pof-fi-menus' +'?_limit=-1',
    method: 'GET',
    headers: {'Content-Type': 'application/json'}
}

data =  strapi_fetch(options)

console.log(util.inspect(data))
