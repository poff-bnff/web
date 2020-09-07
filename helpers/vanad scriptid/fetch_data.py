# -*- coding: UTF-8 -*-
from __future__ import print_function
import yaml
import pickle
import os.path
import inspect
import json
import jsonpickle
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

#lülitan välja automaatse YAML ankrute genereerimise
class NoAliasDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True

totalcount = 0
sheets = []

os.chdir(os.path.dirname(__file__))



def authenticate():

    # If modifying these scopes, delete the file token.pickle.
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

    print("authenticating")
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    return creds


def connect(creds):
    print('connecting')
    service = build('sheets', 'v4', credentials=creds)
    return service


def fetchDataFromSheet(service, sheetName):
    print('\nfetching data from sheet: ' + sheetName)

    # The ID and range of a sample spreadsheet.
    SAMPLE_SPREADSHEET_ID = '1J_cYJnZI41V8TGuOa8GVDjnHSD9qRmgKTJR3sd9Ff7Y'
    SAMPLE_RANGE_NAME = sheetName

    # Call the Sheets API
    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=SAMPLE_SPREADSHEET_ID,
                                range=SAMPLE_RANGE_NAME).execute()
    values = result.get('values', [])
    return values


def createYAML(values, dataSources, location):
    # Check if any values found
    if not values:
        print('No data found.')
    else:
        print('Creating YAML')
        # Counter
        count = 0
        dict_file = []
        headers = []
        for row in values:
            if count == 0:
                for x in row:
                    headers.append(x)
            else:
                if row[0]:
                    count2 = 0
                    data = {}
                    for x in row:
                        #siin saab PyYAML aru, et dataSource on iga kord sama ja asendab selle ankruga
                        if count2 == 0 and bool(dataSources) == True:
                            data['data'] = dataSources
                        data[headers[count2]] = row[count2].strip()
                        count2 = count2 + 1
                    dict_file = dict_file + [data]
                    with open(r'../source/' + location, 'w', encoding='utf-8') as file:
                        yaml.dump(dict_file, file, default_flow_style=False, sort_keys=False, indent=4, allow_unicode=True, Dumper=NoAliasDumper, width=9999999)
                        #width=9999999 == pika teksti rida ei pakita lühemaks
                        #print(yaml.safe_dump(interfaces))
                        #print(yaml.dump(interfaces, Dumper=NoAliasDumper))
            count = count + 1




def main(sheetName, location, dataSources):
    if __name__ == '__main__':

        values = fetchDataFromSheet(service, sheetName)
        createYAML(values, dataSources, location)

        global totalcount
        totalcount = totalcount + 1
        sheets.append(sheetName)


def authconnect():
    creds = authenticate()
    service = connect(creds)
    return service



def report():
    print('\nFetched ' + str(totalcount) + ' sheets:')

    for x in sheets:
        print(x)

    return len(sheets)



""" siin kutsun välja üleval defineeritud funtiooni andes kaasa parameetritena:
- sheetName = Google sheets lehekülje nimi kust infot loeme
- location = kuhu fail genereeritakse ja mis selle nimi on (nt 'asukoht/failiNimi.yaml')
- dataSources = dictionary tüüpi objekt lisatavatest failidest (nt {'pictures': '/film_pictures.yaml', 'screenings': 'screenings.yaml'})
    kui ei ole midagi vaja lisada  kirjuta {}
"""
"""
The issue with this is the use of aliases.
Basically since the data I had in the ‘services’ dictionary was the same as what
I had in parameters pyYAML recognized that and created the alias &id001 pointing at that data,
then referenced it rather than copying that data into parameters.

class MyDumper(yaml.Dumper):
def ignore_aliases(self, _data):
return True



"""

service = authconnect()

#main('Artiklid', 'article/data.yaml', {'article_pictures': '/article_pictures.yaml'})
main('art-et', 'article/data.et.yaml', {'article_pictures': '/article_pictures.yaml'})
main('art-en', 'article/data.en.yaml', {'article_pictures': '/article_pictures.yaml'})
main('art-ru', 'article/data.ru.yaml', {'article_pictures': '/article_pictures.yaml'})

#main('Events', 'events/data.yaml', {})
main('events-et', 'events/data.et.yaml', {})
main('events-en', 'events/data.en.yaml', {})
main('events-ru', 'events/data.ru.yaml', {})

#main('Filmid', 'film/data.yaml', {'pictures': '/film_pictures.yaml', 'screenings': 'screenings.yaml'})
main('filmid-et', 'film/data.et.yaml', {'pictures': '/film_pictures.yaml', 'screenings': 'screenings.et.yaml'})
main('filmid-en', 'film/data.en.yaml', {'pictures': '/film_pictures.yaml', 'screenings': 'screenings.en.yaml'})
main('filmid-ru', 'film/data.ru.yaml', {'pictures': '/film_pictures.yaml', 'screenings': 'screenings.ru.yaml'})

#main('Seansid', 'film/screenings.yaml', {})
main('seansid-et', 'film/screenings.et.yaml', {})
main('seansid-en', 'film/screenings.en.yaml', {})
main('seansid-ru', 'film/screenings.ru.yaml', {})

main('persons-et', 'festival/persons.et.yaml', {})
main('persons-en', 'festival/persons.en.yaml', {})

x = report()


