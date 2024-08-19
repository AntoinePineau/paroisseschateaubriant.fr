import requests
import json
import re
import os
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta
import calendar
import PyPDF2
from bs4 import BeautifulSoup


"""
This script crawls https://www.aelf.org/ to download all texts of dates in separated json files
"""   

def calculer_1er_dimanche_avent(annee):
    date_avent = date(annee, 12, 25) - timedelta(days=22)
    while date_avent.weekday() != 6:
        date_avent -= timedelta(days=1)
    return date_avent

def calculer_date_paques(annee):
    a = annee % 19
    b = annee // 100
    c = annee % 100
    d = b // 4
    e = b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i = c // 4
    k = c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    mois = (h + l - 7 * m + 114) // 31
    jour = ((h + l - 7 * m + 114) % 31) + 1

    return date(annee, mois, jour)

def nb_jours(d1, d2):
    return abs((d1 - d2).days)

def determiner_temps_liturgique(date):
    date = datetime.strptime(date, '%Y-%m-%d').date()
    annee = date.year

    date_avent = calculer_1er_dimanche_avent(annee)
    
    date_noel = datetime(annee, 12, 25, 0, 0, 0).date()
    annee_liturgique = annee

    if date >= date_avent:
        annee_liturgique += 1
    else:
        date_avent = calculer_1er_dimanche_avent(annee - 1)
        date_noel = datetime(annee - 1, 12, 25, 0, 0, 0).date()

    annee_liturgique = "C" if annee_liturgique % 3 == 0 else ("A" if annee_liturgique % 3 == 1 else "B")

    dimanche_qui_suit_lepiphanie = date_noel + timedelta(days=12)
    while dimanche_qui_suit_lepiphanie.weekday() != 6:
        dimanche_qui_suit_lepiphanie += timedelta(days=1)

    date_paques = calculer_date_paques(annee)
    date_mercredi_cendres = date_paques - timedelta(days=46)
    date_pentecote = date_paques + timedelta(days=49)
    bapteme_du_seigneur = dimanche_qui_suit_lepiphanie + timedelta(days=1)

    temps_liturgique = ""
    numero_semaine = 0

    if date_avent <= date < date_noel:
        temps_liturgique = "Avent"
        nb = nb_jours(date_avent, date)
        numero_semaine = nb // 7 + 1
    elif date_noel <= date <= bapteme_du_seigneur:
        temps_liturgique = "Noël"
        if date == date_noel:
            numero_semaine = 'Nativité du Seigneur'
        elif date == date_noel + timedelta(days=6):
            numero_semaine = 'La Sainte Famille'
        elif date == date_noel + timedelta(days=11):
            numero_semaine = 'Sainte Marie, Mère de Dieu'
        elif date == dimanche_qui_suit_lepiphanie:
            numero_semaine = 'L\'Epiphanie du Seigneur'
        elif date == bapteme_du_seigneur:
            numero_semaine = 'Le Baptême du Seigneur'
        else:
            nb = nb_jours(date_noel, date)
            numero_semaine = nb // 7 + 1
    elif dimanche_qui_suit_lepiphanie < date < date_mercredi_cendres:
        temps_liturgique = "Ordinaire"
        nb = nb_jours(dimanche_qui_suit_lepiphanie, date)
        numero_semaine = nb // 7 + 1
    elif date_mercredi_cendres <= date < date_paques:
        temps_liturgique = 'Carême'
        if date == date_paques - timedelta(days=1):
            numero_semaine = 'Veillée pascale'
        elif date == date_paques - timedelta(days=2):
            numero_semaine = 'Vendredi saint'
        elif date == date_paques - timedelta(days=3):
            numero_semaine = 'Jeudi saint'
        elif date == date_paques - timedelta(days=7):
            numero_semaine = 'Dimanche des Rameaux et de la Passion'
        elif date == date_mercredi_cendres:
            numero_semaine = 'Mercredi des Cendres'
        else:
            nb = nb_jours(date_mercredi_cendres, date)
            numero_semaine = nb // 7 + 1
    elif date_paques <= date <= date_pentecote:
        temps_liturgique = 'Pascal'
        if date == date_paques:
            numero_semaine = 'Dimanche de la Résurrection'
        elif date == date_paques + timedelta(days=39):
            numero_semaine = 'Ascension du Seigneur'
        elif date == date_pentecote:
            numero_semaine = 'Pentecôte'
        else:
            nb = nb_jours(date_paques, date)
            numero_semaine = nb // 7 + 1
    else:
        temps_liturgique = 'Ordinaire'
        if date == date_pentecote + timedelta(days=7):
            numero_semaine = 'Sainte Trinité'
        elif date == date_pentecote + timedelta(days=14):
            numero_semaine = 'Saint Sacrement'
        elif date == date_pentecote + timedelta(days=19):
            numero_semaine = 'Sacré-Cœur de Jésus'
        else:
            date_futur_avent = calculer_1er_dimanche_avent(date_avent.year + 1)
            nb = nb_jours(date_futur_avent, date)
            numero_semaine = 36 - ((nb // 7) + 1)
    return {
        'numeroSemaine': numero_semaine,
        'tempsLiturgique': temps_liturgique,
        'anneeLiturgique': annee_liturgique
    }

def scrap_aelf(date, id=0):
    url = 'https://www.aelf.org/'+date+'/romain/messe'
    print(url)
    resp = requests.get(url)
    if(resp.status_code != 200):
        return {}
    soup = BeautifulSoup(resp.text, 'html.parser')
    
    dateLiturgique = re.sub('^[— -]*(.*?)[— -]*$', r'\1', soup.find(class_='heading-day').find(class_='m-b-0').find('strong').text)
    couleur = re.sub('Couleur liturgique : (.*)', r'\1', soup.find(class_='heading-day').find(class_='m-b-0').find(class_='span-color').attrs['title'])
    lectures = []
    for i in range(1, 5):
        lectureId = soup.find(id='messe1_lecture'+str(i))
        if not lectureId:
            continue
        type = lectureId.find('h4').text
        if type == 'Psaume' or type == 'Cantique':
            lecture = lectureId.find('h5').text # découper  (1, 1-2, 3, 4.6)
            lecture_titre = lectureId.find('p').find('strong').text # interpréter R/ Qui marche à ta suite, Seigneur,<br> aura la lumière de la vie.<br/> &nbsp;
            lectures.append({
                "type": type,
                "id": re.sub(' +\\((.*)\\)', r'\1', re.sub(' ', ' ', lecture)),
                "titre":re.sub('\\n', ' ', re.sub(' *R[/\\\\] (.*) *', r'\1', re.sub(' |&nbsp;|<br\s*/?>', ' ', lecture_titre)))
            })
        else:
            regex = '^[\s «]*(.*?)[\s »]*?\\((.*)\\) *'
            lecture = lectureId.find('h5').text # découper « Si tu avais prêté attention à mes commandements ! » (Is 48, 17-19)
            if type == 'Évangile':
                alleluia = re.sub('  ', r' ', re.sub('\n', r' ', lectureId.find('p').text))
                print(re.sub('.*\((cf. ?)?(.*)\)', r'\2', alleluia))
                print(re.sub('Alléluia[,. ]+|\(.*?\)', r'', alleluia))
                lectures.append({
                    "type": 'Alléluia',
                    "id": re.sub('.*\((cf. ?)?(.*)\)', r'\2', alleluia),
                    "titre": re.sub('Alléluia. ?|\(.*?\)', r'', alleluia)
                })
            lectures.append({
                "type": type,
                "id": re.sub(regex, r'\2', re.sub(' ', ' ', lecture)),
                "titre": re.sub(regex, r'\1', re.sub(' ', ' ', lecture))
            })
    id = id+1
    temps_liturgique = determiner_temps_liturgique(date)
    return {
        "id": id,
        "annee" : temps_liturgique['anneeLiturgique'],
        "temps" : temps_liturgique['tempsLiturgique'],
        "semaine" : temps_liturgique['numeroSemaine'],
        "couleur" : couleur,
        "jour" : datetime.strptime(date, '%Y-%m-%d').weekday(), # (Monday is 0, Sunday is 6)
        "date": dateLiturgique,
        "originalDate": date,
        "lectures" : lectures
    }

    
def iterate_through_dates(start_date=datetime(2019,1,1), end_date=datetime(2021,12,31)):
    datas = []
    current_date = start_date
    id = 1
    while current_date <= end_date:
        data = scrap_aelf(current_date.strftime("%Y-%m-%d"), id)
        datas.append(data)
        id = data['id']
        current_date += timedelta(days=1)   
    return datas


lectures = iterate_through_dates()
with open("lectures.json", "w", encoding= 'utf-8') as f:
    json.dump(lectures, f, ensure_ascii=False)
