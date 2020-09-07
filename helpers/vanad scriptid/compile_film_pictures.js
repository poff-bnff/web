

const testFolder = 'assets/img/img_films/';
const fs = require('fs');
const yaml = require('js-yaml');
let data = new Object();

data.filmslugs = new Object()

fs.readdirSync(testFolder).forEach(folder => {
    if (folder !== '.DS_Store') {

        console.log(folder);

        filmSlug = {
            poster: '',
            presenter: '',
            pics: []
        }

        fs.readdirSync(testFolder + '/' + folder).forEach(file => {
            if (folder !== '.DS_Store') {

                if (file.substring(0, 4) === 'F_1_') {
                    filmSlug.poster = file
                    //filmSlug.pics.push(file)
                } else if (file.substring(0, 4) === 'E_1_') {
                    filmSlug.presenter = file
                } else {
                    if (file.substring(0, 4) !== 'E_1_') {
                        filmSlug.pics.push(file)
                    }
                }
                console.log(file.substring(0, 3));
                console.log(file);
            }
        });
        filmSlug.pics.unshift(filmSlug.poster);

        data.filmslugs[folder] = filmSlug

        console.log(data)
    }

});


let yamlStr = yaml.safeDump(data);
fs.writeFileSync('source/film_pictures.yaml', yamlStr, 'utf8');

