let path = "/articles"

const FromStrapi = require("./strapi/FromStrapi")

let modelName = path.slice(1, path.length-1)
modelName = modelName[0].toUpperCase() + modelName.substring(1)


//console.log(modelName)

function LogData(strapiData, token){
    console.log(strapiData);
}

// FromStrapi.ValidateAndFetch('/articles', LogData)

function LogProcess(token, dataPath){
    console.log("updating " + dataPath.slice(1) + " from Strapi");
}

FromStrapi.WriteJSON('/countries', '../helpers/data/ISOCountriesFromStrapi.json', LogProcess)




