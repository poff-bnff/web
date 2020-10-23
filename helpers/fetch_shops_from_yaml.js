const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const rueten = require('./rueten.js');

const sourceDir =  path.join(__dirname, '..', 'source');
const fetchDir =  path.join(sourceDir, '_fetchdir');
const fetchDataDir =  path.join(fetchDir, 'products');
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml');
const STRAPIDATA_SHOPS = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['Shop'];
const STRAPIDATA_PROD_CATEGORIES = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['ProductCategory'];
const STRAPIDATA_PROD_PASSES = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['ProductPass'];
const DOMAIN = process.env['DOMAIN'] || 'poff.ee';

const languages = ['en', 'et', 'ru']
const mapping = {
    'poff.ee': 'poff',
    'justfilm.ee': 'justfilm',
    'kinoff.poff.ee': 'kinoff',
    'industry.poff.ee': 'industry',
    'shorts.poff.ee': 'shorts'
}

for (const ix in languages) {
    const lang = languages[ix];
    console.log(`Fetching ${DOMAIN} shops ${lang} data`);

    var allData = []
    for (const ix in STRAPIDATA_SHOPS) {

        if (mapping[DOMAIN]) {
            var templateDomainName = mapping[DOMAIN];
        }else{
            console.log('ERROR! Missing domain name for assigning template.');
            continue;
        }
        let element = JSON.parse(JSON.stringify(STRAPIDATA_SHOPS[ix]));

        if (element.prodCatList && element.prodCatList.length) {
            for (const catListIx in element.prodCatList) {
                let prodCatList = element.prodCatList[catListIx]
                if (prodCatList.product && prodCatList.product.length) {
                    for (const catIx in prodCatList.product) {
                        let category = prodCatList.product[catIx].product_category
                        if (typeof category !== 'undefined') {
                            let categoryFromYAML = STRAPIDATA_PROD_CATEGORIES.filter( (a) => { return category.id === a.id})
                            if (categoryFromYAML.length) {
                                let categoryFromYAMLcopy = JSON.parse(JSON.stringify(categoryFromYAML[0]))

                                prodCatList.product[catIx].product_category = categoryFromYAMLcopy


                                categoryFromYAMLcopy.data = {'articles': '/_fetchdir/articles.' + lang + '.yaml'};
                                if (categoryFromYAMLcopy[`slug_${lang}`]) {
                                    categoryFromYAMLcopy.path = `shop/${categoryFromYAMLcopy[`slug_${lang}`]}`;
                                }
                                let dirSlug = categoryFromYAMLcopy.slug_en || categoryFromYAMLcopy.slug_et ? categoryFromYAMLcopy.slug_en || categoryFromYAMLcopy.slug_et : null ;
                                if (dirSlug != null && typeof categoryFromYAMLcopy.path !== 'undefined') {

                                    rueten(categoryFromYAMLcopy, lang)
                                    const oneYaml = yaml.safeDump(categoryFromYAMLcopy, { 'noRefs': true, 'indent': '4' });
                                    const yamlPath = path.join(fetchDataDir, dirSlug, `data.${lang}.yaml`);


                                    let saveDir = path.join(fetchDataDir, dirSlug);
                                    fs.mkdirSync(saveDir, { recursive: true });

                                    fs.writeFileSync(yamlPath, oneYaml, 'utf8');
                                    fs.writeFileSync(`${saveDir}/index.pug`, `include /_templates/product_${templateDomainName}_index_template.pug`)

                                } else {
                                    console.log(`ERROR! Skipped product_cat ${categoryFromYAMLcopy.id} due to missing slug_en/slug_et`);
                                }



                            }
                        }
                    }
                }
            }
        }


        // for (eIx in element.festival_editions) {
        //     var festivalEdition = element.festival_editions[eIx];

        //     if(element.presentedBy && element.presentedBy[0]) {
        //         for (orgIx in element.presentedBy.organisations) {
        //             let organisationFromYAML = STRAPIDATA_ORGANISATIONS.filter( (a) => { return element.presentedBy.organisations[orgIx].id === a.id })
        //             let organisationCopy = JSON.parse(JSON.stringify(organisationFromYAML[0]))
        //             if (organisationCopy) {
        //                 element.presentedBy.organisations[orgIx] = rueten(organisationCopy, lang);
        //             }
        //         }
        //     }
        // }

        element = rueten(element, lang);

        // for (key in element) {
        //     if (key == 'slug') {
        //         element.path = element[key];
        //         element.slug = element[key];
        //     }
        // }

        // if (element.path === undefined) {
        //     element.path = dirSlug;
        //     element.slug = dirSlug;
        // }

        // element.data = {'articles': '/_fetchdir/articles.' + lang + '.yaml', 'cassettes': '/_fetchdir/cassettes.' + lang + '.yaml'};
        // console.log(element);

        // if (dirSlug != null && typeof element.path !== 'undefined') {


            // const oneYaml = yaml.safeDump(element, { 'noRefs': true, 'indent': '4' });
            // const yamlPath = path.join(fetchDataDir, dirSlug, `data.${lang}.yaml`);

            allData.push(element)

            // let saveDir = path.join(fetchDataDir, dirSlug);
            // fs.mkdirSync(saveDir, { recursive: true });

            // fs.writeFileSync(yamlPath, oneYaml, 'utf8');
            // fs.writeFileSync(`${saveDir}/index.pug`, `include /_templates/programmes_${templateDomainName}_index_template.pug`)
        // }

    }

    // const allDataSorted = allData.sort(function(a, b) {
    //         // nulls sort after anything else
    //         if (a.order === undefined) {
    //             return 1;
    //         }
    //         else if (b.order === undefined) {
    //             return -1;
    //         } else {
    //             return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0);
    //         }
    // })
    const allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
    const yamlPath = path.join(fetchDir, `shops.${lang}.yaml`);
    fs.writeFileSync(yamlPath, allDataYAML, 'utf8');
    // console.log(allData);
}
