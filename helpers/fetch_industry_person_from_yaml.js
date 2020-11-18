const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const slugify = require('slugify');
const rueten = require('./rueten.js');

const sourceDir =  path.join(__dirname, '..', 'source');
const fetchDir =  path.join(sourceDir, '_fetchdir');
const fetchDataDir =  path.join(fetchDir, 'industrypersons');
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml');
const STRAPIDATA_IN_PERSONS = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['IndustryPerson'];
const STRAPIDATA_PERSONS = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['Person'];

const rootDir =  path.join(__dirname, '..')
const domainSpecificsPath = path.join(rootDir, 'domain_specifics.yaml')
const DOMAIN_SPECIFICS = yaml.safeLoad(fs.readFileSync(domainSpecificsPath, 'utf8'))

const DOMAIN = process.env['DOMAIN'] || 'industry.poff.ee';

const languages = DOMAIN_SPECIFICS.locales[DOMAIN]
for (const ix in languages) {
    const lang = languages[ix];
    console.log(`Fetching ${DOMAIN} industry persons ${lang} data`);

    allData = []
    for (const ix in STRAPIDATA_IN_PERSONS) {
        let element = JSON.parse(JSON.stringify(STRAPIDATA_IN_PERSONS[ix]));


        // if (DOMAIN === 'justfilm.ee') {
        //     var templateDomainName = 'justfilm';
        // } else if (DOMAIN === 'shorts.poff.ee') {
        //     var templateDomainName = 'shorts';
        // } else if (DOMAIN === 'kinoff.poff.ee') {
        //     var templateDomainName = 'kinoff';
        // } else if (DOMAIN === 'industry.poff.ee') {
        //     var templateDomainName = 'industry';
        // } else {
        //     var templateDomainName = 'poff';
        // }

        var templateDomainName = 'industry';


        // if (element.groupType) {
        //     var templateGroupName = element.groupType.toLowerCase();
        // } else {
        //     console.log('ERROR!: Team templateGroupName missing for team with ID no ', element.id);
        //     continue;
        // }

        // for (const subTeamIx in element.subTeam) {
        //     let subTeam = element.subTeam[subTeamIx];
        //     for (const juryMemberIx in subTeam.juryMember) {
        //         let juryMember = subTeam.juryMember[juryMemberIx];
        //         let personFromYAML = STRAPIDATA_PERSONS.filter( (a) => { return juryMember.person.id === a.id });
        //         juryMember.person = personFromYAML[0];
        //     }
        // }


        // rueten func. is run for each element separately instead of whole data, that is
        // for the purpose of saving slug_en before it will be removed by rueten func.


        // let dirSlug = element.slug_en || element.slug_et ? element.slug_en || element.slug_et : null ;
        element = rueten(element, lang);
        // element.data = {'articles': '/_fetchdir/articles.' + lang + '.yaml'};
        // element.path = element.slug;

        if (element.person) {
            let personFirstName = element.person.firstName || ''
            let personLastName = element.person.lastName || ''
            var personNameWithID = `${personFirstName} ${personLastName} ${element.person.id}`
        } else {
            console.log(`ERROR! Industry person ID ${element.id} not linked to any person, skipped.`)
            continue
        }

        if (personNameWithID && personNameWithID.length > 5) {
            var dirSlug = slugify(personNameWithID)
            element.slug = dirSlug
            element.data = {'articles': '/_fetchdir/articles.' + lang + '.yaml'};
            element.path = element.slug;
        } else {
            var dirSlug = null
        }


        if (element.clipUrl) {
            if(element.clipUrl && element.clipUrl.length > 10) {
                if (element.clipUrl.includes('vimeo')) {
                    let splitVimeoLink = element.clipUrl.split('/')
                    let videoCode = splitVimeoLink !== undefined ? splitVimeoLink[splitVimeoLink.length-1] : ''
                    if (videoCode.length === 9) {
                        element.clipUrlCode = videoCode
                    }
                } else {
                    let splitYouTubeLink = element.clipUrl.split('=')[1]
                    let splitForVideoCode = splitYouTubeLink !== undefined ? splitYouTubeLink.split('&')[0] : ''
                    if (splitForVideoCode.length === 11) {
                        element.clipUrlCode = splitForVideoCode
                    }
                }
            }
        }

        const oneYaml = yaml.safeDump(element, { 'noRefs': true, 'indent': '4' });

        if (dirSlug != null) {
            const yamlPath = path.join(fetchDataDir, dirSlug, `data.${lang}.yaml`);
            let saveDir = path.join(fetchDataDir, dirSlug);
            fs.mkdirSync(saveDir, { recursive: true });

            fs.writeFileSync(yamlPath, oneYaml, 'utf8');
            fs.writeFileSync(`${saveDir}/index.pug`, `include /_templates/industryperson_${templateDomainName}_index_template.pug`)
            allData.push(element);
        }
    }

    const yamlPath = path.join(fetchDir, `industrypersons.${lang}.yaml`);
    if (allData.length) {
        allData = allData.sort((a, b) => `${a.person.firstName} ${a.person.lastname}`.localeCompare(`${b.person.firstName} ${b.person.lastname}`, lang))
        const allDataYAML = yaml.safeDump(allData, { 'noRefs': true, 'indent': '4' });
        fs.writeFileSync(yamlPath, allDataYAML, 'utf8');










        let filters = {
            types: {},
            roleatfilms: {},
            lookingfors: {},
        }

        const industry_persons_search = allData.map(persons => {

            let types = []
            let person = persons.person
            if (typeof persons.industry_person_types !== 'undefined') {
                let industry_person_types = persons.industry_person_types.map(type => type.type)
                for (const type of industry_person_types) {
                    types.push(type)
                    filters.types[type] = type
                }
            }

            let roleatfilms = []

            for (const role of (persons.role_at_films || [])
                .sort(function(a, b){ return (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0) })
                 || []) {
                const roleName = role.roleName
                roleatfilms.push(roleName)
                filters.roleatfilms[roleName] = roleName
            }

            let lookingfors = []

            if (persons.lookingFor) {
                const lookingFor = persons.lookingFor
                lookingfors.push(lookingFor)
                filters.lookingfors[lookingFor] = lookingFor
            }

            let filmographies = []
            for (const filmography of persons.filmography || []) {
                if (filmography && filmography.text) {
                    filmographies.push(filmography.text)
                }
                if (filmography.film) {
                    for (const film of filmography.film) {

                        filmographies.push(`${film.title} ${film.title} ${film.synopsis}`)

                    }
                }
            }


            return {
                id: persons.id,
                text: [
                    `${person.firstName} ${person.lastName}`,
                    persons.emailAtInd,
                    persons.phoneAtInd,
                    persons.aboutText,
                    persons.lookingFor,
                    persons.website,
                    filmographies,
                ].join(' ').toLowerCase(),
                types: types,
                roleatfilms: roleatfilms,
                lookingfors: lookingfors,
            }
        });

        function mSort(to_sort) {
            let sortable = []
            for (var item in to_sort) {
                sortable.push([item, to_sort[item]]);
            }

            sortable = sortable.sort(function(a, b) {
                try {
                    const locale_sort = a[1].localeCompare(b[1], lang)
                    return locale_sort
                } catch (error) {
                    console.log('failed to sort', JSON.stringify({a, b}, null, 4));
                    throw new Error(error)
                }
            });

            var objSorted = {}
            for (let index = 0; index < sortable.length; index++) {
                const item = sortable[index];
                objSorted[item[0]]=item[1]
            }
            return objSorted
        }

        let sorted_filters = {
            types: mSort(filters.types),
            roleatfilms: mSort(filters.roleatfilms),
            lookingfors: mSort(filters.lookingfors),
        }

        let searchYAML = yaml.safeDump(industry_persons_search, { 'noRefs': true, 'indent': '4' })
        fs.writeFileSync(path.join(fetchDir, `search_industry_persons.${lang}.yaml`), searchYAML, 'utf8')

        let filtersYAML = yaml.safeDump(sorted_filters, { 'noRefs': true, 'indent': '4' })
        fs.writeFileSync(path.join(fetchDir, `filters_industry_persons.${lang}.yaml`), filtersYAML, 'utf8')










    } else {
        console.log('No data for industry persons, creating empty YAML');
        fs.writeFileSync(yamlPath, '[]', 'utf8');
    }
}
