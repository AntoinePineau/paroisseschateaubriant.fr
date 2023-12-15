import requests
import json
import re
import os
import time
import PyPDF2
from bs4 import BeautifulSoup


"""
This script crawls https://www.aelf.org/bible to download all texts in separated json files
"""

def scrap_texts(testament, book, url, chapitres=[]):
    print(url)
    doContinue = True
    chapitre = re.sub('^.*/([^/]+)$', r'\1', url)
    chapitres.append(chapitre)
    resp = requests.get('https://www.aelf.org'+url)
    if(resp.status_code != 200):
        return chapitres
    soup = BeautifulSoup(resp.text, 'html.parser')
    lines = soup.find(id='right-col').find_all('p')
    versets = []
    for line in lines:
        id = line.find('span', class_='verse_number')
        if not id:
            id = line.find('span', class_='text-danger')
            doContinue = False
        versets.append({ id.text : ''.join(line.find_all(string=True, recursive=False)).strip()})
    #with open(testament+"/"+book+"/"+chapitre+".json", "w", encoding= 'utf-8') as f:
    #    json.dump(versets, f, ensure_ascii=False)
    pagination = soup.find(id='pagination')
    if pagination and doContinue:
        span = pagination.find('span')
        next = span.find_next_sibling('a')
        if next:
            scrap_texts(testament, book, next.attrs['href'], chapitres)
    return chapitres

        

def scrap_bible():
    bible = []
    resp = requests.get('https://www.aelf.org/bible')
    if(resp.status_code != 200):
        return bible
    soup = BeautifulSoup(resp.text, 'html.parser')
    tabs = soup.find_all('div', class_='tab-pane')
    for tab in tabs:
        id = tab.attrs['id']
        print('================================')
        print(id)
        print('================================')
        testament = []
        books = tab.find_all('a')
        for book in books:
            href = book.attrs['href']
            book_id = re.sub('^/bible/([^/]+)/.*$', r'\1', href) 
            os.makedirs(id+'/'+book_id, exist_ok=True)
            name = book.text 
            print('--------------------------------')
            print(name)
            print('--------------------------------')
            chapitres = scrap_texts(id, book_id, href, [])
            t = {
                'id': book_id,
                'name': name
            }
            if len(chapitres) > 0:
                t['books'] = chapitres
            testament.append(t)
        bible.append({id : testament})
    return bible
    

bible = scrap_bible()
with open("bible.json", "w", encoding= 'utf-8') as f:
    json.dump(bible, f, ensure_ascii=False)
