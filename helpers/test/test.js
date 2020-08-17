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


function getData(callback, lang) {
    request(options, function (error, response) {
        if (error)
            throw new Error(error);
        let data = new Object();
        data = JSON.parse(response.body);
        callback(data, lang);
    });
}

function getDataCB(data, lang) {

    data.forEach(element => {
        // console.log(element.slug_en);
        fs.mkdir(`helpers/test/${element.slug_en}`, bla);

        let elementEt = JSON.parse(JSON.stringify(element));

        // Object.keys(elementEt).forEach(item => {
        //     console.log(item.substring(item.length - 3, item.length));
        //     let lastThree = item.substring(item.length - 3, item.length);
        //     if (lastThree === '_en' || lastThree === '_ru') {
        //         // delete elementEt[item];
        //     }
        //   });


        for (key in elementEt) {
        // for (i = 0; i < Object.keys(elementEt).length; i++) {
            // let item = elementEt[0];
            // let item2 = item[Object.keys(item)];

            // console.log('aaaaaaaaaaaa' + key);
            // console.log('aaaaaaaaaaaa' + Object.keys(item));
            // console.log(item.substring(item.length - 3, item.length));
            let lastThree = key.substring(key.length - 3, key.length);
            let findHyphen = key.substring(key.length - 3, key.length -2);
            if (lastThree !== `_${lang}` && findHyphen === '_' && lastThree !== '_by' && lastThree !== '_at') {
                delete elementEt[key];
            }
            if(lastThree === `_${lang}`) {
                if(key.substring(0, key.length -3) == 'slug') {
                    elementEt.path = elementEt[key];
                }
                elementEt[key.substring(0, key.length -3)] = elementEt[key];
                delete elementEt[key];
            }
        }


        //   console.log(elementEt);
        let yamlStr = yaml.safeDump(elementEt, {'indent':'4'});
        console.log(elementEt);
        console.log('LANGUAAAAAG: ' + lang);

        fs.writeFileSync(`helpers/test/${element.slug_en}/data.${lang}.yaml`, yamlStr, 'utf8', {space: 2});

    // YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAML END

    });

}

function bla() {
    console.log('tere');
}

getData(getDataCB, "en");
getData(getDataCB, "et");
getData(getDataCB, "ru");



// for (x in data) {
//     console.log('bla: ' + x.id);
// }
