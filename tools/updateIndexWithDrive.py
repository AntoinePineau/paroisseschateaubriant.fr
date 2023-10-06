import csv
import json
import re

f = open("psaumesIndex.json")
psaumes = json.dumps(json.load(f))
f.close()

with open('pdfs.txt') as csvfile:
    csvReader = csv.reader(csvfile, delimiter=';')
    for row in csvReader:
        psaumes = re.sub('psaumes/partitions/'+row[0]+'.pdf', row[1], psaumes)

with open('mp3s.txt') as csvfile:
    csvReader = csv.reader(csvfile, delimiter=';')
    for row in csvReader:
        psaumes = re.sub('psaumes/musiques/'+row[0]+'.mp3', row[1], psaumes)

psaumesJson = json.loads(psaumes)
with open("psaumesIndexBackup.json", "w", encoding= 'utf-8') as f:
    json.dump(psaumesJson, f, ensure_ascii=False)
