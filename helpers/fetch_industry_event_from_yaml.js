const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const ical = require('ical-generator');
const rueten = require('./rueten.js');

const rootDir =  path.join(__dirname, '..')
const domainSpecificsPath = path.join(rootDir, 'domain_specifics.yaml')
const DOMAIN_SPECIFICS = yaml.safeLoad(fs.readFileSync(domainSpecificsPath, 'utf8'))

const sourceDir =  path.join(rootDir, 'source');
const fetchDir =  path.join(sourceDir, '_fetchdir');
const fetchDataDir =  path.join(fetchDir, 'industryevents');
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml');
const STRAPIDATA_INDUSTRY_EVENT = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))['IndustryEvent'];
const DOMAIN = process.env['DOMAIN'] || 'industry.poff.ee';

const mapping = DOMAIN_SPECIFICS.domain
const allLanguages = DOMAIN_SPECIFICS.locales[DOMAIN]

function convert_to_UTC(datetime) {
    datetime = datetime ? new Date(datetime) : new Date()
    try {
        return new Date(
            Date.UTC(
                datetime.getUTCFullYear(),
                datetime.getUTCMonth(),
                datetime.getUTCDate(),
                datetime.getUTCHours(),
                datetime.getUTCMinutes(),
                datetime.getUTCSeconds(),
                datetime.getUTCMilliseconds()
            )
        )
    } catch (error) {
        throw new Error('Invalid input date')
    }

}

const currentTimeUTC = convert_to_UTC()


for (const lang of allLanguages) {
    const industryPersonsPath = path.join(fetchDir, `industrypersons.${lang}.yaml`)
    const industryPersonsYaml = yaml.safeLoad(fs.readFileSync(industryPersonsPath, 'utf8'));
    const industryProjectsPath = path.join(fetchDir, `industryprojects.${lang}.yaml`)
    const industryProjectsYaml = yaml.safeLoad(fs.readFileSync(industryProjectsPath, 'utf8'));

    console.log(`Fetching ${DOMAIN} Industry Event ${lang} data`);

    var allData = []
    for (const ix in STRAPIDATA_INDUSTRY_EVENT) {

        let element = JSON.parse(JSON.stringify(STRAPIDATA_INDUSTRY_EVENT[ix]));

        if (!element.startTime) {
            console.log(`ERROR! Industry event ID ${element.id} missing startTime`);
            continue
        }

        if (!element.publish) {
            continue
        }

        if (element.publishFrom && convert_to_UTC(element.publishFrom) > currentTimeUTC) {
            continue
        }

        if (element.publishUntil && convert_to_UTC(element.publishUntil) < currentTimeUTC) {
            continue
        }

        if (element[`slug_${lang}`]) {
            let dirSlug = element[`slug_${lang}`]
            element.path = `events/${dirSlug}`
            element.data = {'articles': '/_fetchdir/articles.' + lang + '.yaml'};

            if (element.industry_people) {
                element.industry_people = element.industry_people.map(people => {
                    return industryPersonsYaml.filter(a => a.id === people.id)[0]
                })
            }
            if (element.industry_projects) {
                element.industry_projects = element.industry_projects.map(projects => {
                    return industryProjectsYaml.filter(a => a.id === projects.id)[0] || projects
                })
            }

            element = rueten(element, lang);


            // https://github.com/sebbo2002/ical-generator#readme
            let eventstart = convert_to_UTC(element.startTime)
            let eventend = new Date(eventstart)
            if(element.durationTime) {
                if (element.durationTime.split(':')[1] !== '00') {
                    eventend.setUTCMinutes(eventend.getUTCMinutes()+parseInt(element.durationTime.split(':')[1]))
                }
                if (element.durationTime.split(':')[0] !== '00') {
                    eventend.setUTCHours(eventend.getUTCHours()+parseInt(element.durationTime.split(':')[0]))
                }
                // console.log(eventend, eventend.getUTCMinutes(), parseInt(element.durationTime.substring(3, 5)));
            }
            element.calendar_data = escape(ical({
                domain: 'industry.poff.ee',
                prodId: '//industry.poff.ee//Industry@Tallinn//EN',
                events: [
                    {
                        start: convert_to_UTC(element.startTime),
                        end: eventend,
                        timestamp: convert_to_UTC(element.startTime),
                        description: element.description,
                        location: element.location && element.location.hall && element.location.hall.cinema ? element.location.hall.cinema.name + `: http://industry.poff.ee/events/${element.slug}` : undefined,
                        summary: element.title,
                        organizer: {
                            name: 'Industry@Tallinn & Baltic Event',
                            email: 'industry@poff.ee'
                        }
                    }
                ]
            }).toString())

            // console.log(eventstart, ' - ', eventend, ' durtime:', element.durationTime, element.durationTime ? element.durationTime.substring(3, 5) : 'none');

            const oneYaml = yaml.safeDump(rueten(element, lang), { 'noRefs': true, 'indent': '4' });
            const yamlPath = path.join(fetchDataDir, dirSlug, `data.${lang}.yaml`);

            let saveDir = path.join(fetchDataDir, dirSlug);
            fs.mkdirSync(saveDir, { recursive: true });

            fs.writeFileSync(yamlPath, oneYaml, 'utf8');
            fs.writeFileSync(`${saveDir}/index.pug`, `include /_templates/industry_event_index_template.pug`)

            allData.push(element)
        } else {
            console.log(`ERROR! Industry event ID ${element.id} missing slug`);
        }
    }
    let dataToYAML = []

    if (allData.length) {
        dataToYAML = allData.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        console.log(`${dataToYAML.length} Industry Events ready for building`);
    }
    const allDataYAML = yaml.safeDump(dataToYAML, { 'noRefs': true, 'indent': '4' });
    const yamlPath = path.join(fetchDir, `industryevents.${lang}.yaml`);
    fs.writeFileSync(yamlPath, allDataYAML, 'utf8');
    // console.log(allData);
}
