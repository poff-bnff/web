const fs = require('fs');
var request = require('request');
const yaml = require('js-yaml');


var options = {
  'method': 'GET',
  'url': 'http://139.59.130.149/films',
  'headers': {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTk3MjQwNDA2LCJleHAiOjE1OTk4MzI0MDZ9.ZddzcDSe7O130sr4dtxr2XOSP7j-BTmlOI8TGxWgKdM'
  }
};


function getData(callback) {
    request(options, function (error, response) {
        if (error)
            throw new Error(error);
        let data = new Object();
        data = JSON.parse(response.body);
        callback(data);
    });
}

function getDataCB(data) {

    data.forEach(element => {
        console.log(element.slug_en);
        fs.mkdir(`helpers/test/${element.slug_en}`, bla);

        let yamlStr = yaml.safeDump(element, {'indent':'4'});
        fs.writeFileSync(`helpers/test/${element.slug_en}/data.yaml`, yamlStr, 'utf8', {space: 2});

    // YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAML END

    });

}

function bla() {
    console.log('tere')
}

getData(getDataCB)


// for (x in data) {
//     console.log('bla: ' + x.id);
// }
