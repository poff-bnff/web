const fs = require('fs');
var request = require('request');


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
        //   console.log(response.body);
        let data = new Object();
        data = JSON.parse(response.body);
        // console.log(data) + ' bla';
        callback(data);
    });
}

function getDataCB(data) {

    data.forEach(element => {
        console.log(element.slug_en);
        fs.mkdir(`helpers/test/${element.slug_en}`, bla);
    });

}

function bla() {
    console.log('tere')
}

getData(getDataCB)


// for (x in data) {
//     console.log('bla: ' + x.id);
// }
