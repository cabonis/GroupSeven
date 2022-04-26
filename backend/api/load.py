import csv
import requests

def load():
    for source in Source:
        # Download CSV Data
        url = source.url
        with requests.Session() as s:
            download = s.get(CSV_URL)

            decoded_content = download.content.decode('utf-8')

            cr = csv.reader(decoded_content.splitlines(), delimiter=',')
            data = list(cr)

        # Load into DB
        db.load(data, source)
