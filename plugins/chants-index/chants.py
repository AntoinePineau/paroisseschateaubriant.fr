
import re
import json


"""
This script crawls folder index it and matches categories in chants.csv if defined => generates chantsIndex.json index 
"""

def get_all_pdf_from_folder(folder_path):
    '''
    Get all PDF files from given folder
    '''
    import glob
    import os
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
    parses the chants.csv file to get the mapping of categories for each chant
    '''
    import csv
    mapping = {}
    with open("chants.csv", 'r') as f:
        csv_reader = csv.reader(f, delimiter=';')
        for row in csv_reader:
            if len(row)>1:
                categories = re.split('[ /]', row[0])
                mapping[row[1].lower()] = categories
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
        usedMapping = []
        categoryNotFound = []
        mapping = get_mapping()
        pdf_file = ''
        pdf_name = re.sub('.*/(.*?)( [(-].*)?\.pdf', r'\1', pdf_file).lower()
        categories = mapping.get(pdf_name, [])
        if not categories:
            if re.match('.*[Aa]gn(eau|us).*', pdf_name):
                categories.append('AG')
            if re.match('.*(Vierge|Mari[ea]).*', pdf_name):
                categories.append('M')
            if re.match('.*[Aa]ll.lu.a.*', pdf_name):
                categories.append('AL')
            if re.match('^[G]lo(ire|ria).*', pdf_name):
                categories.append('GL')
            if re.match('.*[Aa]namn.se.*', pdf_name):
                categories.append('AN')
            if re.match('.*[Mm]esse.*', pdf_name):
                categories.append('ME')
        if categories and pdf_name not in usedMapping:
            usedMapping.append(pdf_file) 
        elif not categories:
            categoryNotFound.append(pdf_file)
            print(pdf_name, "[NOT FOUND]")

        with open("usedMapping.txt", "w", encoding= 'utf-8') as f:
            for i in usedMapping:
                f.write(str(i) + '\n')
        with open("categoryNotFound.txt", "w", encoding= 'utf-8') as f:
            for i in categoryNotFound:
                f.write(str(i) + '\n')
