const FromStrapi = require('./FromStrapi')


function LogProcess(token, modelName){
    console.log("updating " + modelName + " from Strapi");
}



// FromStrapi.WriteJSON('Country', './data/ISOCountriesFromStrapi.json', LogProcess)
// FromStrapi.WriteJSON('Language', './data/ISOLanguages.json', LogProcess)
// FromStrapi.WriteJSON('Film', './data/FilmsFromStrapi.json', LogProcess)
// FromStrapi.WriteJSON('Article', './data/articlesFromStrapi.json', LogProcess)
FromStrapi.WriteJSON('FestivalEdition', './data/FestivalEFromStrapi.json', LogProcess)

// FromStrapi.WriteJSON('HeroArticlePoff', './data/TEST.json', LogProcess)

// FromStrapi.WriteJSON('TrioBlockPoff', './data/TEST.json', LogProcess)
