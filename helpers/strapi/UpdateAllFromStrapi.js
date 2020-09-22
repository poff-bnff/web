const fs = require('fs');
const FromStrapi = require('./FromStrapi')


function AfterFetch(modelName, strapiData){
    let filePath = './data/test_' + modelName + '.json'
    fs.writeFileSync(filePath, JSON.stringify(strapiData, null, 4))
    console.log("updated " + modelName + " from Strapi to " + filePath)
}


// FromStrapi.Fetch('Country', './data/ISOCountriesFromStrapi.json', LogProcess)
// FromStrapi.Fetch('Language', './data/ISOLanguages.json', LogProcess)
// FromStrapi.Fetch('Film', './data/FilmsFromStrapi.json', LogProcess)

// FromStrapi.Fetch('POFFiArticle', AfterFetch)

// FromStrapi.Fetch('FestivalEdition', AfterFetch)
// FromStrapi.Fetch('Team', AfterFetch)
// FromStrapi.Fetch('HeroArticlePoff', AfterFetch)
// FromStrapi.Fetch('TrioBlockPoff', AfterFetch)
// FromStrapi.Fetch('Footer', AfterFetch)
// FromStrapi.Fetch('ShotsiArticle', AfterFetch)
// FromStrapi.Fetch('JustFilmiArticle', AfterFetch)
FromStrapi.Fetch('POFFiMenu', AfterFetch)
