import requests
import json
import re
import PyPDF2
from bs4 import BeautifulSoup

def getPdfText(pdf_path):
    pdf = open(pdf_path, 'rb')
    reader = PyPDF2.PdfReader(pdf)
    text = ''
    for page in reader.pages:
        text = text + ' ' + page.extract_text().replace(' ', '  ').replace('\n', ' ').replace('¢', '').replace('°', '').replace('  ', ' ')
    pdf.close()
    return text

def download_file(url, name):
    open(name, 'wb').write(requests.get(url, allow_redirects=True).content)

def scrap_psaume_page(annee, temps, url, name, date):
    # Web Scraping
    soup = BeautifulSoup(requests.get(url).text, 'html.parser')
    pdf = soup.find('a', class_='piwik_download').attrs['href']
    mp3 = soup.find('a', class_='wavesurfer-track active').attrs['href']

    # Download and read files
    pdf_file = 'psaumes/partitions/'+name+'.pdf'
    mp3_file = 'psaumes/musiques/'+name+'.mp3'
    download_file(pdf, pdf_file)
    text = getPdfText(pdf_file)
    mp3s = []

    # Check if several mp3s to associate
    if not re.search(' et ',name):
        download_file(mp3, mp3_file)
        mp3s.append(mp3_file)
    else:
        for i in re.split('[a-zA-Z ,]', name):
            if not i=='':
                mp3s.append('psaumes/musiques/Psaume '+i+'.mp3')

    date = date.replace("’", "'").replace("–", "-")
    id = re.sub('^(.*?) - .*', r'\1', re.sub('^(\d+).*$', r'\1', date))
    return {
        "id": id,
        "type": "psaume",
        "annee" : annee,
        "temps" : temps,
        "date": date,
        "nom": name.replace("’", "'").replace("–", "-"),
        "titre": soup.find('h3').text.replace("’", "'").replace("–", "-"),
        "pdf": pdf_file,
        "mp3": mp3s,
        "text": text
    }

def scrap_article(annee, temps, article):
    psaume_link = article.find('h2').find('a')
    psaume_page = psaume_link.attrs['href']
    date = psaume_link.attrs['title']
    psaume_name = article.find('div', class_='entry-summary').text
    return scrap_psaume_page(annee, temps, psaume_page, psaume_name, date)

def scrap_page(annee, temps, url, page, psaumes):
    resp = requests.get(url)
    if(resp.status_code != 200):
        return psaumes
    soup = BeautifulSoup(resp.text, 'html.parser')
    articles = soup.find_all('article')
    for a in articles:
        psaumes.append(scrap_article(annee, temps, a))        
    return scrap_page(annee, temps, re.sub('^(.*?)/page/.*$', r'\1', url)+'/page/'+str(page+1)+'/', page+1, psaumes)


psaumes = []
for a in ['a', 'b', 'c']:
    scrap_page(a.upper(), 'Avent', 'https://www.sos-messe.fr/temps-de-l-avent-annee-'+a+'/', 1, psaumes)
    scrap_page(a.upper(), 'Noël', 'https://www.sos-messe.fr/temps-de-noel-annee-'+a+'/', 1, psaumes)
    scrap_page(a.upper(), 'Carême', 'https://www.sos-messe.fr/temps-du-careme-annee-'+a+'/', 1, psaumes)
    scrap_page(a.upper(), 'Pascal', 'https://www.sos-messe.fr/temps-pascal-annee-'+a+'/', 1, psaumes)
    scrap_page(a.upper(), 'Ordinaire', 'https://www.sos-messe.fr/temps-ordinaire-annee-'+a+'/', 1, psaumes)

with open("psaumesIndex.json", "w", encoding= 'utf-8') as f:
    json.dump(psaumes, f, ensure_ascii=False)
