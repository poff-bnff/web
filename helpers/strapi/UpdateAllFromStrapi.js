const FromStrapi = require('./FromStrapi')


function LogProcess(token, dataPath){
    console.log("updating " + dataPath.slice(1) + " from Strapi");
}


FromStrapi.WriteJSON('/countries', './data/ISOCountriesFromStrapi.json', LogProcess)
FromStrapi.WriteJSON('/languages', './data/ISOLanguages.json', LogProcess)
FromStrapi.WriteJSON('/films', './data/FilmsFromStrapi.json', LogProcess)
FromStrapi.WriteJSON('/articles', './data/articlesFromStrapi.json', LogProcess)

FromStrapi.WriteJSON('/article-hero', './data/TEST.json', LogProcess)

