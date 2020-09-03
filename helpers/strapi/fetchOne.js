const AuthStrapi = require('./AuthStrapi');

function FetchOne(dataPath, id, token){

    let GetDataFromStrapi = function(dataPath, token, CBfunction){
        let options = {
            //see võiks tulla muutujast
            host: process.env['StrapiHost'],
            // ?_limit=-1 see tagab, et strapi tagastab kogu data, mitte 100 esimest nagu on vaikimisi säte
            path: dataPath + '/' + id,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token}
        }
        console.log(path);
        let req = http.request(options, function (response) {
            let allData = '';
            response.on('data', function (chunk) {
                allData += chunk;
            });
            response.on('end', function () {
                let strapiData = JSON.parse(allData)
                if (!Array.isArray(strapiData)){
                    strapiData = [strapiData]
                }

                strapiData = strapiData.filter(checkDomain)

                RefetchIfNeeded(modelName, strapiData, token, CBfunction)
            });
            response.on('error', function (error) {
                console.log(error);
            });
        });
        req.on('error', function (error) {
            console.log(error);
        })
        req.end()
    };
    GetDataFromStrapi(dataPath, token, CBfunction);
}
AuthStrapi.Auth(FetchOne)

FetchOne('/trio-block-poeff', 1, token)

