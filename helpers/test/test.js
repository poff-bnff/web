
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



    console.log(data[1]);
}

getData(getDataCB)


// for (x in data) {
//     console.log('bla: ' + x.id);
// }
