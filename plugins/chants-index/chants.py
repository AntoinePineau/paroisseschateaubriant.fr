
import re
import os
import json


"""
This script crawls folder index it and matches categories in chants.csv if defined => generates chantsIndex.json index 
"""

def get_all_pdf_from_folder(folder_path):
    '''
    Get all PDF files from given folder
    '''
    import glob
    # List all files in the folder and its subfolders recursively
    all_files = glob.glob(os.path.join(folder_path, '**', '*'), recursive=True)
    # Filter only PDF files
    return [file for file in all_files if file.lower().endswith('.pdf')]


def get_file_link_by_path(drive, root_folder_id, file_path):
    """
    Get Google Drive Shareable Link from the subpath of a root folder ID
    """
    # Search for the file within the final folder
    title_encoded = re.sub("'", "\\'", re.sub('^.*/([^/]*)$', r'\1', file_path))
    query = f"'{root_folder_id}' in parents and title = '{title_encoded}' and trashed=false"
    print('Google Drive query: '+query)
    file_list = drive.ListFile({'q': query}).GetList()

    if not file_list:
        print(f"File '{title_encoded}' not found in '{root_folder_id}'.")
        return None

    # Get the shareable link
    link = file_list[0]['alternateLink']
    print(f"Google Drive Link: {link}")
    return link


def authenticate():     
    """
    Authenticate on Google Drive
    """
    from pydrive2.auth import GoogleAuth
    from googleapiclient.errors import HttpError
    from pydrive2.drive import GoogleDrive
    try:
        gauth = GoogleAuth()
        gauth.LocalWebserverAuth()
        drive = GoogleDrive(gauth)
        print("Authentication successful.")
        return drive
    except HttpError as e:
        print(f"An HTTP error occurred: {e}")
        print(f"Error details: {e.content}")
        return None


def download_file_from_google_drive(drive, file_id, destination):
    """
    Download a file from Google Drive using its file ID.
    
    Parameters:
    - file_id: The Google Drive file ID (you can get it from the shareable link).
    - destination: The local path where the file should be saved.
    """
    # Get the file
    file = drive.CreateFile({'id': file_id})
    
    # Download the file to the specified destination
    file.GetContentFile(destination)


def wait_for_file(file_path, timeout=300, interval=5):
    """
    Wait for a file to exist before proceeding.

    Parameters:
    - file_path (str): The path to the file.
    - timeout (int): Maximum time to wait in seconds. Default is 300 seconds (5 minutes).
    - interval (int): Time between checks in seconds. Default is 5 seconds.
    """
    import time
    start_time = time.time()

    while not os.path.exists(file_path):
        if time.time() - start_time > timeout:
            print(f"Timeout reached. File '{file_path}' not found.")
            break

        time.sleep(interval)

    print(f"File '{file_path}' found.")


def get_pdf_text(pdf_path):
    '''
    parses and returns the text of the PDF which path is given
    '''
    import PyPDF2
    pdf = open(pdf_path, 'rb')
    reader = PyPDF2.PdfReader(pdf)
    text = ''
    for page in reader.pages:
        text = text + ' ' + re.sub('/G[0-9]. ?', '', page.extract_text().replace(' ', '  ').replace('\n', ' ').replace('¢', '').replace('°', '').replace('  ', ' '))
    pdf.close()
    return text


def get_mapping():
    '''
    parses the chants-categorises.json file to get the mapping of categories for each chant
    '''
    mapping = {}    
    f = open("chants-categorises.json")
    mapping = json.load(f)
    f.close()
    return mapping


def create_index():
    '''
    creates the chantsIndex.json file without categories
    '''
    drive = authenticate()
    folderId = '1tujVCzh1gQDBG81k77xCpIo1TTiMlkOh' # "chants/autres" folder ID on Google Drive
    folder = '/mnt/c/Users/apine/Downloads/Partitions'
    chants = []
    pdf_files = get_all_pdf_from_folder(folder)
    id=1
    for pdf_path in pdf_files:
        pdf_full_name = re.sub('.*/(.*?( [(-].*)?)\.pdf', r'\1', pdf_path)
        text = get_pdf_text(pdf_path)
        drive_link = get_file_link_by_path(drive, folderId, pdf_path)
        if(not drive_link):
            break
        chants.append({
            "id": id,
            "tag": [],
            "titre": pdf_full_name,
            "pdf": drive_link,
            "text": text
        })
        id+=1

    with open("chantsIndex.json", "w", encoding= 'utf-8') as f:
        json.dump(chants, f, ensure_ascii=False)


def add_chant_to_index(titre, pdf, tag=[]):
    '''
    Examples: 
    python3 chants.py add_chant_to_index "Demeurez en mon amour - Accords" "1Bh2ZIJliBezjOtDLUGK4EOkf2kiqjpHU" "COM"
    python3 chants.py add_chant_to_index "Debout resplendis - Accords" "1Bi-mojca0KLn2lhbcbTJGqdNp_EIc5Md" "EN"
    python3 chants.py add_chant_to_index "Gloria (Messe de la Trinité)" "1BiJHyphvZgjnLj5pedAihhh1EXokCk5d" "GL"
    '''
    indexFile = "../../dist/index/chants.json"
    f = open(indexFile)
    chants = json.load(f)
    f.close()
    nextId = chants[-1]['id'] + 1
    tmpFile = '/tmp/'+titre+'.pdf'
    drive = authenticate()
    download_file_from_google_drive(drive, pdf, tmpFile)
    wait_for_file(tmpFile)
    text = get_pdf_text(tmpFile)
    os.remove(tmpFile)
    chants.append({
        "id": nextId,
        "tag": tag.split(','),
        "titre": titre,
        "pdf": pdf,
        "text": text
    })
    with open(indexFile, "w", encoding= 'utf-8') as f:
        json.dump(chants, f, ensure_ascii=False)


def add_categories_to_chant_in_index(titre, tag=[]):
    '''
    Examples: 
    python3 chants.py add_categories_to_chant_in_index "Demeurez en mon amour - Accords" "COM"
    '''
    indexFile = "../../dist/index/chants.json"
    f = open(indexFile)
    chants = json.load(f)
    f.close()
    for chant in chants:
        if chant['titre'].lower() == titre.lower():
            tags = chant['tag']
            if type(tag)=='str':
                for t in tag.split(','):
                    tags.append(t)
            else:
                for t in tag:
                    tags.append(t)
            chant['tag'] = tags
            break
    with open(indexFile, "w", encoding= 'utf-8') as f:
        json.dump(chants, f, ensure_ascii=False)


def prepare_categories():
    '''
    '''
    import csv
    filename = 'chants-additionnels.csv'
    chants={}
    with open(filename, 'r') as f:
        csv_reader = csv.reader(f, delimiter=';')
        for row in csv_reader:
            categories = row[0].split('/')
            titre = re.sub('^(.*?) ?\(.*\)$', r'\1', row[1]).lower()
            if titre in chants:
                for c in categories:
                    if c not in chants[titre]:
                        chants[titre].append(c)
            else:
                chants[titre] = categories
    print(str(len(chants))+' chants')
    with open('chants-categorises.json', "w", encoding= 'utf-8') as f:
        json.dump(chants, f, ensure_ascii=False)
    


if __name__ == "__main__":
    """
    Main entry point to update the categories
    """
    import sys
    if len(sys.argv) > 1:
        function_name = sys.argv[1]
        arguments = sys.argv[2:]
        function_to_call = globals().get(function_name)
        if function_to_call is not None and callable(function_to_call):
            if arguments:
                print(function_to_call(*arguments))
            else:
                print(function_to_call())
        else:
            print(function_name, "is not a valid function name")
    else:
        indexFile = "../../dist/index/chants.json"
        f = open(indexFile)
        chants = json.load(f)
        f.close()

        usedMapping = []
        categoryNotFound = []
        mapping = get_mapping()

        for chant in chants:
            pdf_name = re.sub('^(.*?) ?(\(|-).*$', r'\1', chant['titre']).lower()
            categories = mapping.get(pdf_name, [])
            if not categories:
                categories = []
            if 'AG' not in categories and re.match('.*[Aa]gn(eau|us).*', chant['titre']):
                categories.append('AG')
            if 'M' not in categories and re.match('.*(Vierge|Mari[ea]).*', chant['titre']):
                categories.append('M')
            if 'GL' not in categories and re.match('^[G]lo(ire|ria).*', chant['titre']):
                categories.append('GL')
            if 'AN' not in categories and re.match('.*[Aa]namn.se.*', chant['titre']):
                categories.append('AN')
            if 'ME' not in categories and re.match('.*[Mm]esse.*', chant['titre']):
                categories.append('ME')
            if categories and pdf_name not in usedMapping:
                usedMapping.append(chant['titre']) 
            elif not categories:
                categoryNotFound.append(chant['titre'])
                print(pdf_name, "[NOT FOUND]")
            add_categories_to_chant_in_index(chant['titre'], categories)

        with open("usedMapping.txt", "w", encoding= 'utf-8') as f:
            for i in usedMapping:
                f.write(str(i) + '\n')
        with open("categoryNotFound.txt", "w", encoding= 'utf-8') as f:
            for i in categoryNotFound:
                f.write(str(i) + '\n')
        
