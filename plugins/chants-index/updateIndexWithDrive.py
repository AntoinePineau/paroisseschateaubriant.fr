import csv
import json
import re
from googleapiclient.errors import HttpError
from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive

"""
This script creates the psaumes.json from the psaumeIndex.json by replacing the Google Drive shareable link for each MP3 and PDF files
"""


"""
   Get Google Drive Shareable Link from the subpath of a root folder ID
"""
def get_file_link_by_path(drive, root_folder_id, file_path):

    # Split the file path into individual folder names
    folder_names = file_path.split('/')

    length = len(folder_names)

    # Start with the root folder ID
    current_folder_id = root_folder_id

    # Traverse the folder structure to find the file
    for i, folder_name in enumerate(folder_names):
        # Search for the folder within the current folder
        if i < length -1:
            folder_encoded = folder_name.encode('utf-8').decode('unicode-escape')
            query = f"'{current_folder_id}' in parents and title = '{folder_encoded}' and trashed=false"
            print(f"Search for folder '{folder_encoded}' in '{current_folder_id}'")
            folder_list = drive.ListFile({'q': query}).GetList()
            if not folder_list:
                print(f"Folder '{folder_encoded}' not found in '{current_folder_id}'.")
                return None

            # Update the current folder ID for the next iteration
            current_folder_id = folder_list[0]['id']

    # Search for the file within the final folder
    title_encoded = folder_names[-1].encode('utf-8').decode('unicode-escape')
    query = f"'{current_folder_id}' in parents and title = '{title_encoded}' and trashed=false"
    print('Google Drive query: '+query)
    file_list = drive.ListFile({'q': query}).GetList()

    if not file_list:
        print(f"File '{title_encoded}' not found in '{current_folder_id}'.")
        return None

    # Get the shareable link
    link = file_list[0]['alternateLink']
    print(f"Google Drive Link: {link}")
    return link

"""
Authenticate on Google Drive
"""
def authenticate():
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


"""
Main entry point
"""
if __name__ == "__main__":
    drive = authenticate()

    folderId = '1ESwhde70U0QoDY3USnNqFRcSQTzP1-EH' # "psaumes" folder ID on Google Drive
    def replace_filepath_with_drivelink(match):
        file_name = match.group(1)
        file_link = get_file_link_by_path(drive, folderId, file_name)
        return file_link or match.group(0)

    f = open("psaumesIndex.json")
    psaumes = json.dumps(json.load(f))
    f.close()
    psaumes = re.sub('psaumes/([^"]+.(mp3|pdf))', replace_filepath_with_drivelink, psaumes)

    psaumesJson = json.loads(psaumes)
    with open("psaumes.json", "w", encoding= 'utf-8') as f:
        json.dump(psaumesJson, f, ensure_ascii=False)
