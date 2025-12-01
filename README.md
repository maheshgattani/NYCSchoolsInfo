The script expects 5 files in CSV format to exist in the same folder as the script itself:
- 1 LCGMS file that contains data about all the schools
- 3 zoning files that contain zoning data for zoned schools
- 2 ranking files representing ranks for elementary and middle schools

The script needs pandas and geopandas installed. 

LCGMS data:
- All Schools fetched from https://infohub.nyced.org/in-our-schools/operations/lcgms.
- Download is in excel format. The script expects it in csv. I uploaded the excel to google sheet and downloaded a csv format file.

Zone data:
- Zoning data downloaded from: https://data.cityofnewyork.us/browse?tags=school+zones&sortBy=relevance&pageSize=20
- Specifically for 2024-25:
  - Elementary: https://data.cityofnewyork.us/Education/School-Zones-2024-2025-Elementary-School-/cmjf-yawu/about_data
  - Middle: https://data.cityofnewyork.us/Education/School-Zones-2024-2025-Middle-School-/t26j-jbq7/about_data
  - High: https://data.cityofnewyork.us/Education/School-Zones-2024-2025-High-School-/ruu9-egea/about_data

Ranking data:
- School Rankings downloaded from SchoolDigger for Manhattan and Brooklyn.
- I downloaded the elementary and middle school rankings separately for Manhattan and Brooklyn by printing their webpage (4 files).
- Then I used grok to convert them into CSVs using similar prompts for Elementary and Middle school files : "Can you parse these two pdfs? These contain Middle schools in manhattan and brooklyn and their rankings. Once you parse and merge the two file, can you create a csv with the columns: school name, state rank, total schools. Order the CSV by school rank."
