#######################################
# COVID 19 Data Prep
# Aggregates Data into JSON from multi
# CSV file for simplification in D3
# Mohamed M. Morsy
# July 24th 2020
#######################################
import pandas as pd
import numpy as np
import json
import pycountry_convert as pc

def country_to_continent(country_name):
    country_alpha2 = pc.country_name_to_country_alpha2(country_name)
    country_continent_code = pc.country_alpha2_to_continent_code(country_alpha2)
    country_continent_name = pc.convert_continent_code_to_continent_name(country_continent_code)
    return country_continent_name

# Load Data from CSV files
confirmed_df = pd.read_csv("time_series_covid19_confirmed_global.csv")
deaths_df = pd.read_csv("time_series_covid19_deaths_global.csv")
recovered_df = pd.read_csv("time_series_covid19_recovered_global.csv")

# Change Country/Region to just Country 
confirmed_df = confirmed_df.rename(columns={"Country/Region":"country"})
deaths_df = deaths_df.rename(columns={"Country/Region":"country"})
recovered_df = recovered_df.rename(columns={"Country/Region":"country"})

# Aggregate by country sum for cases where there is more than one state
confirmed_df = confirmed_df.groupby("country", as_index=True).sum()
deaths_df = deaths_df.groupby("country", as_index=True).sum()
recovered_df = recovered_df.groupby("country", as_index=True).sum()

# Drop unknown countries
confirmed_df = confirmed_df.drop(["Holy See", "Diamond Princess", "MS Zaandam"], axis=0)
deaths_df = deaths_df.drop(["Holy See", "Diamond Princess", "MS Zaandam"], axis=0)
recovered_df = recovered_df.drop(["Holy See", "Diamond Princess", "MS Zaandam"], axis=0)

# Add continent Name
unknown_countries = {
    "Burma" : "Asia",
    "Congo (Brazzaville)" : "Africa",
    "Congo (Kinshasa)" : "Africa",
    "Cote d'Ivoire" : "Africa",
    "Korea, South" : "Asia",
    "Kosovo" : "Europe",
    "Taiwan*" : "Asia",
    "Timor-Leste" : "Asia",
    "US" : "North America",
    "West Bank and Gaza" : "Asia",
    "Western Sahara" : "Africa"
}
continents = {}
for country in confirmed_df.index:
    try:
        continents[country] = country_to_continent(country)
    except:
        continents[country] = unknown_countries.get(country, "N/A")

continents_df_data = {"country" : [], "continent": []}
for key, value in continents.items():
    continents_df_data["country"].append(key)
    continents_df_data["continent"].append(value)


continents_df = pd.DataFrame(data=continents_df_data)
continents_df.to_csv("../data/continents.csv", index=False)

# Drop long & lat columns
confirmed_df = confirmed_df.drop(["Lat", "Long"], axis=1)
deaths_df = deaths_df.drop(["Lat", "Long"], axis=1)
recovered_df = recovered_df.drop(["Lat", "Long"], axis=1)

confirmed_df = confirmed_df.fillna(0)
deaths_df = deaths_df.fillna(0)
recovered_df = recovered_df.fillna(0)

# Save to new CSVs for D3 simplification
confirmed_df.to_csv("../data/confirmed.csv")
deaths_df.to_csv("../data/deaths.csv")
recovered_df.to_csv("../data/recovered.csv")
new_confirmed_df = confirmed_df.transpose()
new_deaths_df = deaths_df.transpose()
new_recovered_df = recovered_df.transpose()

new_confirmed_df.index.names = ["date"]
new_deaths_df.index.names = ["date"]
new_recovered_df.index.names = ["date"]
new_confirmed_df.to_csv("../data/confirmed_t.csv")
new_deaths_df.to_csv("../data/deaths_t.csv")
new_recovered_df.to_csv("../data/recovered_t.csv")