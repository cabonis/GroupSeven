
class Source():
    def __init__(self, name, url, columns):
        self.name = name
        self.url = url
        self.columns = columns

SOURCES = [
    Source(
        'covid',
        'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv',
        ['date', 'county', 'state', 'fips', 'cases', 'deaths']
    ),
    Source(
        'vaccinations',
        'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/United%20States.csv',
        ['location', 'date', 'vaccine', 'source_url', 'total_vaccinations', 'people_vaccinated', 'people_fully_vaccinated', 'total_boosters'],
    ),
    Source(
        'hospitalizations',
        'https://healthdata.gov/api/views/g62h-syeh/rows.csv', 
        ['date', 'critical_staffing_shortage_today_yes'],
    ),
    Source(
        'census', 
        'https://www2.census.gov/programs-surveys/popest/datasets/2010-2020/national/totals/nst-est2020.csv', 
        ['SUMLEV', 'REGION',' DIVISION', 'STATE', 'NAME', 'CENSUS2010POP', 'ESTIMATESBASE2010',POPESTIMATE2010,POPESTIMATE2011,POPESTIMATE2012,POPESTIMATE2013,POPESTIMATE2014,POPESTIMATE2015,POPESTIMATE2016,POPESTIMATE2017,POPESTIMATE2018,POPESTIMATE2019,POPESTIMATE042020,POPESTIMATE2020],
    ),
]
