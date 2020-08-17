from __future__ import print_function
from datetime import datetime, timedelta
import yaml
import os

os.chdir(os.path.dirname(__file__))

#data = sorted(parsed_yaml_file, key = lambda i: (i['screeningDate'], i['screeningCinema'], i['screeningTime']))

def compileScreeningsCalendar (source, output):

    yaml_file = open("../source/film/"+source, encoding='utf-8')
    screeningsData = yaml.load(yaml_file, Loader=yaml.FullLoader)

    calendarData = {}
    for s in screeningsData:
        #siin on määratud mitu tundi südaööst võib seansi algus üle olla, et arvestataks samasse päeva
        hours = -4
        #google sheets date formaat pythonile mõistetavaks kuupäevaks ja kellaajak

        myBeforeDateTime = (datetime.strptime(s['screeningDatetime'], '%Y-%m-%dT%H:%M:%S%z') + timedelta(hours=hours))
        #eraldame kuupäevast ja kellaajast kuu ja päeva
        myBeforeDate = "d"+ str(myBeforeDateTime.date())
        myDate = calendarData.get(myBeforeDate, dict())
        myCinema = myDate.get(s['screeningCinema'], [])
        myCinema.append({'screeningDatetime': s['screeningDatetime'],'dateTimeForSorting': myBeforeDateTime, 'filmTitle': s['filmTitle'], 'filmPath': s['filmPath']})

        myDate[s['screeningCinema']] = sorted(myCinema, key = lambda i: (i['dateTimeForSorting']))
        calendarData[myBeforeDate] = myDate

    with open(r'../source/film/'+output, 'w', encoding='utf-8') as file:
        yaml.dump(calendarData, file, default_flow_style=False, sort_keys=True, indent=4, allow_unicode=True)

    print("compiling " + output)

#compileScreeningsCalendar('screenings.yaml', 'screeningsCalendar.yaml')
compileScreeningsCalendar('screenings.en.yaml', 'screeningsCalendar.en.yaml')
compileScreeningsCalendar('screenings.et.yaml', 'screeningsCalendar.et.yaml')

