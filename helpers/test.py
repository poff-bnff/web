from __future__ import print_function
from datetime import datetime, timedelta
import yaml
import os

#lülitan välja automaatse YAML ankrute genereerimise
class NoAliasDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True

os.chdir(os.path.dirname(__file__))

#data = sorted(parsed_yaml_file, key = lambda i: (i['screeningDate'], i['screeningCinema'], i['screeningTime']))
sortOrder={"Athena Keskus":0, "Raekoja plats":1, "Elisa Stage":2}

#funktsioonid, et teha string kus on dateTime py-le arusaadavaks dateTime-iks ja date-iks
def formatDateTime(dateTime):
    return str(datetime.strptime(dateTime, '%Y-%m-%dT%H:%M:%S%z'))

def formatedDate(dateTime):
    return str((datetime.strptime(dateTime, '%Y-%m-%dT%H:%M:%S%z')).date())

yaml_file = open("../source/film/screenings.et.yaml", encoding='utf-8')
screeningsData = yaml.load(yaml_file, Loader=yaml.FullLoader)

calendarDays = []
#screeningData on list of dictionarys
for screening in screeningsData:
    #screening on dictionary tüüpi
    oneDay = []
    for item in calendarDays:
        if item['calendarDate'] == formatedDate(screening['calendarDateTime']):
            #item=[{'calendarDate': '2020-08-10'},]
            oneDay = item
    if oneDay == []:
        calendarDays.append({'calendarDate': formatedDate(screening['calendarDateTime']), 'cinemas': []})
##KAS CALENDARDAYES PEAKS SORTEERIMA??
# print(calendarDays)
# print(calendarDays[0]['cinemas'])
# print(calendarDays[0]['calendarDate'])
# print("")

#otsin screeningCinemad kuupäeva kaupa välja ja panen objekti sisse
cinemas = []
for day in calendarDays:
    for screening in screeningsData:
        if day['calendarDate'] == formatedDate(screening['calendarDateTime']):
            cinemas.append({'cinema': screening['screeningCinema'], 'screenings': []})
            # print("in calendarDays: " + str(day['calendarDate']))
            # print("in screeningsData: " + formatedDate(screening['calendarDateTime']))
            # print(screening['screeningCinema'])
    day['cinemas']=list({v['cinema']:v for v in cinemas}.values())

#screeningEventivalId



# #käin läbi kõik päevad calendarDays loendis
# for day in calendarDays:
#     screenings =[]
#     #print('calendarDate in calendarDays: ' + day['calendarDate'])
#     #print(day['cinemas']
# #KALENDAR DAY TULEB SCREENINGU JÄRGI

#käin läbi kõik screeningud screenings.yaml failis
for screening in screeningsData:
    #print('calendarDate in screenings: '+ formatedDate(screening['calendarDateTime']))
    #print(screening)
    [day] = [d for d in calendarDays if d['calendarDate'] == formatedDate(screening['calendarDateTime'])]
    print(day)
    [cinema] = [c for c in day['cinemas'] if c['cinema'] == screening['screeningCinema']]
    #c_ix = day['cinemas'].index(cinema) indexit ei ole vaja sest panen tagasi juba referentsiga
    cinema['screenings'].append({'filmTitle': screening['filmTitle'], 'screeningTime' : screening['screeningTime'], 'filmPath': screening['filmPath'] })
    print (cinema)
    #day['cinemas'][c_ix] = cinema
    print(day)


    # for c in day['cinemas']:
    #     if c['cinema'] == screening['screeningCinema']:
    #         print(c['cinema'] + " on " + screening['screeningCinema'])
    #         screenings.append(screening['filmTitle'])
    #         print(screenings)
    #         c['screenings'] = screenings
    #kui kuupäev on sama, siis pean võrdlema calendarDays loendis oleva cinemas loendi väärtuseid screening.yaml screeningCinema väärtusega
    # if day['calendarDate'] == formatedDate(screening['calendarDateTime']):
    #     print(day['calendarDate'] + ' on sama mis ' + formatedDate(screening['calendarDateTime']) )
    #     for c in day['cinemas']:
    #         if c['cinema'] == screening['screeningCinema']:
    #             print(c['cinema'] + " on " + screening['screeningCinema'])
    #             screenings.append(screening['filmTitle'])
    #             print(screenings)
    #             c['screenings'] = screenings

        #print(screenings)
        #print('selle külge panen seansid ' + c['cinema'])

    # for c in day['cinemas']:
    #     #print('cinema in calendarDays: ' + c['cinema'])
    #     for screening in screeningsData:
    #         ##print('calendarDate in screenings: '+ formatedDate(screening['calendarDateTime']))
    #         #print('cinema in screeningsData: ' + screening['screeningCinema'])
    #         if day['calendarDate'] == formatedDate(screening['calendarDateTime']) and c['cinema'] == screening['screeningCinema']:
    #             print('ühe päeva, ühe kino filmid on: ')
    #             screenings.append(screening['filmTitle'])
    #     print(screenings)
    #         #c['screenings'] = screenings
    #             #print()
    #             #print('cinema in calendarDays: ' + c['cinema'])
    #             #print('cinema in screeningsData: ' + screening['screeningCinema'])

# screenings =[]
# for day in calendarDays:
#     ##print('calendarDate in calendarDays: ' + day['calendarDate'])
#     #print(day['cinemas'])
#     for c in day['cinemas']:
#         #print('cinema in calendarDays: ' + c['cinema'])
#         for screening in screeningsData:
#             #print('cinema in screeningsData: ' + screening['screeningCinema'])
#             ##print('calendarDate in screenings: '+ formatedDate(screening['calendarDateTime']))
#             if day['calendarDate'] == formatedDate(screening['calendarDateTime']) and c['cinema'] == screening['screeningCinema']:
#                 print('ühe päeva, ühe kino filmid on: ')
#                 screenings.append(screening['filmTitle'])
#         print(screenings)
#             #c['screenings'] = screenings
#                 #print()
#                 #print('cinema in calendarDays: ' + c['cinema'])
#                 #print('cinema in screeningsData: ' + screening['screeningCinema'])


# screenings =[]
# for day in calendarDays:

#     for c in cinemas:
#         print(c['cinema'])
#         for s in screeningsData:
#             if s['screeningCinema'] == c['cinema']:
#                 print(s['screeningCinema'])
#                 #print(day['calendarDate']+screening['screeningCinema'] + s['filmTitle'])
#                 screenings.append({'filmTitle': s['filmTitle'], 'calendarDateTime': s['calendarDateTime']})
#             #c['screenings']= screenings

#             #print(screenings)
#             #s['screeningCinema'] == c['cinema']
#             #day['calendarDate'] == formatedDate(s['calendarDateTime'])



#DIFFERENT WAYS OF makinga unique list kui listi sees on dic siis ei tööta
#print(cinemas)
# unique_items = list(dict.fromkeys(cinemas))
# print(unique_items)
# myset = list(set(cinemas))
# print(myset)
            #cinemas.append()
#             # print(day)
#             # print(screening['screeningCinema'])
#             # print(day['cinemas']) #list kinosid
#             for cinema in day['cinemas']:
#                 print(cinema)
#                 if screening['screeningCinema'] not in cinema:
#                     print("käes")
#                     day['cinemas'].append({'screeningCinema': screening['screeningCinema']})

#             print(day['cinemas'])


with open(r'TESTbetter.yaml', 'w', encoding='utf-8') as file:
    yaml.dump(calendarDays, file, default_flow_style=False, sort_keys=True, indent=4, allow_unicode=True, Dumper=NoAliasDumper)


