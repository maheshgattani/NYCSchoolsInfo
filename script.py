import pandas as pd
import geopandas as gpd
from shapely.wkt import loads
import difflib
import re

def clean_school_name(name):
    """Standardize school name for matching by removing common variations and special characters"""
    if pd.isna(name):
        return ''
    name = str(name).lower()
    # Remove common prefixes/suffixes and special characters
    replacements = [
        # Specific school name mappings for edge cases
        ('academy for collaborative exploration', 'institute for collaborative education'),
        ('kathleen grimm school for leadership and sustainability', 'kathleen grimm school for leadership'),
        ('ps 166 richard rodgers', 'ps 166 richard rogers'),  # Rodgers vs Rogers spelling
        ('ps is 173 fort washington in heights', 'ps 173'),
        ('ps/ms 200 magnet of global studies and leadership', 'ps/ms 200 magnet global studi'),
        ('ps 80 the thurgood marshall magnet school of multimedia and communication', 'ps 80 thurgood marshall magnet school of multimedia'),
        ('junior high school ', 'jhs '),
        ('j.h.s. ', 'jhs '),
        ('jhs ', 'jhs '),  # keep this to standardize after other replacements
        ('middle school ', 'ms '),  # Add space to avoid partial matches
        ('m.s. ', 'ms '),
        ('p.s./i.s.', 'ps is'),  # Add this to handle combined PS/IS format
        ('ps/is', 'ps is'),      # Add this to handle combined format without periods
        ('p.s.', 'ps'),
        ('m.s.', 'ms'),
        ('i.s.', 'is'),
        ('the ', ''),            # Remove 'the' at start
        ('(the)', ''),
        (' (the)', ''),
        (' the ', ' '),         # Remove 'the' in middle
        ('elementary school', ''),
        ('secondary school', ''),
        ('high school', ''),
        ('middle school', 'ms'),
        (' school', ''),
        (' hs', ''),
        (' ms', ''),
        (' es', ''),
        ('ps 00', 'ps '),  # handle double leading zeros
        ('ms 00', 'ms '),
        ('is 00', 'is '),
        ('jhs 00', 'jhs '),
        ('ps 0', 'ps '),   # handle single leading zero
        ('ms 0', 'ms '),
        ('is 0', 'is '),
        ('jhs 0', 'jhs '),
        (' - ', ' '),
        ('-', ' '),
        (':', ''),
        ('.', ''),
        (',', ''),
        ('  ', ' '),  # Remove double spaces
        ('elementary school', ''),
        ('secondary school', ''),
        ('high school', ''),
        ('sciencetech', 'science technology'),
        ('Garnett', 'Garnet'),
        ('ms 419', 'ps 419'),
    ]
    for old, new in replacements:
        name = name.replace(old, new)
    
    # Remove borough codes from end of numbers (e.g. 184m -> 184)
    name = re.sub(r'(\d+)[kxmqr]', r'\1', name)
    
    # Remove borough names from the end of the school name
    # This handles cases like "P.S. 089 Bronx" -> "ps 89"
    borough_names = ['manhattan', 'bronx', 'brooklyn', 'queens', 'staten island', 'staten is', 'jackson heights']
    for borough in borough_names:
        # Remove borough name if it appears at the end (with optional leading space)
        if name.endswith(' ' + borough):
            name = name[:-len(' ' + borough)]
        elif name.endswith(borough):
            name = name[:-len(borough)]
    
    name = name.strip()
    
    # Final post-processing mappings for specific edge cases
    # These are applied AFTER all other transformations
    final_mappings = {
        'ps is 173 fort washington in heights': 'ps 173',
        'ps/ms 200 magnet of global studies and leadership': 'ps/ms 200 magnet global studi',
        'ps 166 richard rodgers of arts and technology': 'ps 166 richard rogers of arts & science',
    }
    
    if name in final_mappings:
        name = final_mappings[name]
    
    return name

def main():
    # Read the CSV files
    lcgms_df = pd.read_csv('GeneralSchoolData/LCGMS_SchoolData_20251130_1323.csv')

    # Filter for New York, Manhattan and Brooklyn (case insensitive)
    # lcgms_df = lcgms_df[
    #     lcgms_df['City'].str.lower().isin(['new york', 'manhattan', 'brooklyn'])
    # ]

    # Read other files
    elementary_zones_df = pd.read_csv('ZoningData/School_Zones_2024-2025_(Elementary_School)_20251130.csv')
    middle_zones_df = pd.read_csv('ZoningData/School_Zones_2024-2025_(Middle_School)_20251130.csv')
    high_zones_df = pd.read_csv('ZoningData/School_Zones_2024-2025_(High_School)_20251130.csv')

    # Read the ranking files
    elementary_rankings_df = pd.read_csv('RankingData/SchoolDigger/ElementarySchools.csv')
    middle_rankings_df = pd.read_csv('RankingData/SchoolDigger/MiddleSchools.csv')

    # Extract Total Schools values from ranking dataframes
    total_elementary_schools_ranked = elementary_rankings_df['Total Schools'].iloc[0]
    total_middle_schools_ranked = middle_rankings_df['Total Schools'].iloc[0]

    # Create standardized name columns for matching
    lcgms_df['Clean Name'] = lcgms_df['Location Name'].apply(clean_school_name)
    elementary_rankings_df['Clean Name'] = elementary_rankings_df['School Name'].apply(clean_school_name)
    middle_rankings_df['Clean Name'] = middle_rankings_df['School Name'].apply(clean_school_name)

    # Get unique DBN values from each zones file
    elementary_dbns = set(elementary_zones_df['DBN'].unique())
    middle_dbns = set(middle_zones_df['DBN'].unique())
    high_dbns = set(high_zones_df['DBN'].unique())

    # Create new columns based on whether ATS System Code exists in respective zone files
    lcgms_df['Zoned Elementary'] = lcgms_df['ATS System Code'].apply(
        lambda x: 'Yes' if x in elementary_dbns else 'No'
    )
    lcgms_df['Zoned Middle'] = lcgms_df['ATS System Code'].apply(
        lambda x: 'Yes' if x in middle_dbns else 'No'
    )
    lcgms_df['Zoned High'] = lcgms_df['ATS System Code'].apply(
        lambda x: 'Yes' if x in high_dbns else 'No'
    )

    # Print total schools count first
    print(f"Total number of schools in LCGMS: {len(lcgms_df)}")

    # Create a filtered dataframe with only zoned schools
    zoned_schools_df = lcgms_df[
        (lcgms_df['Zoned Elementary'] == 'Yes') |
        (lcgms_df['Zoned Middle'] == 'Yes') |
        (lcgms_df['Zoned High'] == 'Yes')
    ]
    
    # Print count of schools zoned for at least one level
    print(f"\nNumber of schools zoned for at least one level: {len(zoned_schools_df)}")
    print(f"Number of zoned elementary schools: {(lcgms_df['Zoned Elementary'] == 'Yes').sum()}")
    print(f"Number of zoned middle schools: {(lcgms_df['Zoned Middle'] == 'Yes').sum()}")
    print(f"Number of zoned high schools: {(lcgms_df['Zoned High'] == 'Yes').sum()}")

    # Create standardized name columns for matching (only for zoned schools)
    zoned_schools_df.loc[:, 'Clean Name'] = zoned_schools_df['Location Name'].apply(clean_school_name)

    # Merge elementary and middle school rankings separately
    zoned_schools_df = pd.merge(
        zoned_schools_df,
        elementary_rankings_df[['Clean Name', 'State Rank']].rename(columns={'State Rank': 'Elementary SchoolDigger Rank'}),
        on='Clean Name',
        how='left'
    )
    
    zoned_schools_df = pd.merge(
        zoned_schools_df,
        middle_rankings_df[['Clean Name', 'State Rank']].rename(columns={'State Rank': 'Middle SchoolDigger Rank'}),
        on='Clean Name',
        how='left'
    )

    # Fuzzy matching for unmatched schools using difflib
    def fuzzy_match_rankings(zoned_df, ranking_df, rank_col_name):
        # Identify unmatched schools
        unmatched_mask = zoned_df[rank_col_name].isna()
        unmatched_schools = zoned_df[unmatched_mask]
        
        # Get available ranking names that haven't been matched
        matched_names = set(zoned_df[~unmatched_mask]['Clean Name'])
        available_rankings = ranking_df[~ranking_df['Clean Name'].isin(matched_names)]
        
        if available_rankings.empty:
            return zoned_df
            
        ranking_names = available_rankings['Clean Name'].tolist()
        ranking_map = dict(zip(available_rankings['Clean Name'], available_rankings['State Rank']))
        
        print(f"Attempting fuzzy match for {len(unmatched_schools)} schools against {len(ranking_names)} rankings...")
        
        matches_found = 0
        for idx, row in unmatched_schools.iterrows():
            clean_name = row['Clean Name']
            if not clean_name:
                continue
                
            # Find best match using difflib
            # cutoff=0.85 is a good balance for school names
            matches = difflib.get_close_matches(clean_name, ranking_names, n=1, cutoff=0.85)
            
            if matches:
                matched_name = matches[0]
                rank = ranking_map[matched_name]
                zoned_df.at[idx, rank_col_name] = rank
                # print(f"Fuzzy match found: '{clean_name}' -> '{matched_name}'")
                matches_found += 1
                
        print(f"Found {matches_found} additional matches via fuzzy matching")
        return zoned_df

    # Apply fuzzy matching
    zoned_schools_df = fuzzy_match_rankings(zoned_schools_df, elementary_rankings_df, 'Elementary SchoolDigger Rank')
    zoned_schools_df = fuzzy_match_rankings(zoned_schools_df, middle_rankings_df, 'Middle SchoolDigger Rank')

    # Drop the temporary clean name column
    zoned_schools_df = zoned_schools_df.drop('Clean Name', axis=1)

    # Use the get method to avoid KeyError
    zoned_schools_df['Elementary SchoolDigger Rank'] = zoned_schools_df.get('Elementary SchoolDigger Rank', pd.Series()).fillna('Not Ranked')
    zoned_schools_df['Middle SchoolDigger Rank'] = zoned_schools_df.get('Middle SchoolDigger Rank', pd.Series()).fillna('Not Ranked')

    # Print ranking statistics for zoned schools
    print("\nRanking Statistics (Zoned Schools Only):")
    
    # Calculate unranked schools correctly by filtering for the specific level first
    unranked_elem = zoned_schools_df[
        (zoned_schools_df['Zoned Elementary'] == 'Yes') & 
        (zoned_schools_df['Elementary SchoolDigger Rank'] == 'Not Ranked')
    ]
    
    unranked_middle = zoned_schools_df[
        (zoned_schools_df['Zoned Middle'] == 'Yes') & 
        (zoned_schools_df['Middle SchoolDigger Rank'] == 'Not Ranked')
    ]
    
    print(f"Zoned schools not ranked in Elementary SchoolDigger: {len(unranked_elem)}")
    print(f"Zoned schools not ranked in Middle SchoolDigger: {len(unranked_middle)}")

    # Save unranked schools to CSV for debugging
    if not unranked_elem.empty:
        unranked_elem.to_csv('debug_unranked_elementary.csv', index=False)
        print("Saved unranked zoned elementary schools to 'debug_unranked_elementary.csv'")
    
    if not unranked_middle.empty:
        unranked_middle.to_csv('debug_unranked_middle.csv', index=False)
        print("Saved unranked zoned middle schools to 'debug_unranked_middle.csv'")

    # Create simplified dataframe with selected columns
    simplified_columns = [
        'ATS System Code', 
        'Location Name',
        'Location Category Description',
        'Primary Address',
        'City',
        'State Code',
        'Zip',
        'Zoned Elementary',
        'Zoned Middle',
        'Zoned High',
        'Elementary SchoolDigger Rank',
        'Middle SchoolDigger Rank'
    ]
    simplified_df = zoned_schools_df[simplified_columns].copy()
    
    # Add Borough column (same as City, converted to title case for consistency)
    # Replace "Staten Is" with "Staten Island" only when not already "Staten Island"
    simplified_df['Borough'] = simplified_df['City'].str.replace(r'(?i)staten\s+is(?!land)', 'Staten Island', regex=True).str.title()
    
    # Combine address fields into a single column
    simplified_df['Full Address'] = simplified_df.apply(
        lambda x: f"{x['Primary Address']}, {x['City']}, {x['State Code']} {x['Zip']}",
        axis=1
    )
    
    # Drop individual address components and keep the combined address
    simplified_df = simplified_df.drop(['Primary Address', 'City', 'State Code', 'Zip'], axis=1)
    
    # Reorder columns to put Full Address and Borough after Location Name
    final_columns = [
        'ATS System Code',
        'Location Name',
        'Location Category Description',
        'Borough',
        'Full Address',
        'Zoned Elementary',
        'Zoned Middle',
        'Zoned High',
        'Elementary SchoolDigger Rank',
        'Middle SchoolDigger Rank'
    ]
    simplified_df = simplified_df[final_columns]

    # Create two sorted versions of simplified_df
    # Sort by Elementary SchoolDigger Rank
    elementary_sorted_df = simplified_df.copy()
    elementary_sorted_df['Sort Key'] = pd.to_numeric(elementary_sorted_df['Elementary SchoolDigger Rank'], errors='coerce')
    elementary_sorted_df = elementary_sorted_df.sort_values('Sort Key', na_position='last').drop('Sort Key', axis=1)

    # Sort by Middle SchoolDigger Rank
    middle_sorted_df = simplified_df.copy()
    middle_sorted_df['Sort Key'] = pd.to_numeric(middle_sorted_df['Middle SchoolDigger Rank'], errors='coerce')
    middle_sorted_df = middle_sorted_df.sort_values('Sort Key', na_position='last').drop('Sort Key', axis=1)

    # Get elementary schools and K-8/middle schools
    elementary_schools = zoned_schools_df[
        (zoned_schools_df['Zoned Elementary'] == 'Yes') & 
        (zoned_schools_df['Elementary SchoolDigger Rank'] != 'Not Ranked')
    ]['ATS System Code'].tolist()

    k8_and_middle_schools = zoned_schools_df[
        ((zoned_schools_df['Location Category Description'] == 'K-8') |
         (zoned_schools_df['Zoned Middle'] == 'Yes')) &
        (zoned_schools_df['Middle SchoolDigger Rank'] != 'Not Ranked')
    ]['ATS System Code'].tolist()

    k8_and_middle_schools1 = zoned_schools_df[
        ((zoned_schools_df['Location Category Description'] == 'K-8') |
         (zoned_schools_df['Zoned Middle'] == 'Yes'))
    ]['ATS System Code'].tolist()

    k8_and_middle_schools2 = zoned_schools_df[
        (zoned_schools_df['Middle SchoolDigger Rank'] != 'Not Ranked')
    ]['ATS System Code'].tolist()

    print(f"Number of ranked elementary schools: {len(elementary_schools)}")
    print(f"Number of ranked middle schools: {len(k8_and_middle_schools)}")

    # Convert the_geom column to geometry using loads
    elementary_zones_df['geometry'] = elementary_zones_df['the_geom'].apply(loads)
    middle_zones_df['geometry'] = middle_zones_df['the_geom'].apply(loads)

    # Convert to GeoDataFrames
    elementary_zones_gdf = gpd.GeoDataFrame(elementary_zones_df, geometry='geometry')
    middle_zones_gdf = gpd.GeoDataFrame(middle_zones_df, geometry='geometry')
    
    # Filter for relevant schools
    elementary_zones_filtered = elementary_zones_gdf[elementary_zones_gdf['DBN'].isin(elementary_schools) & elementary_zones_gdf['DBN'].notna()]
    middle_zones_filtered = middle_zones_gdf[middle_zones_gdf['DBN'].isin(k8_and_middle_schools) & middle_zones_gdf['DBN'].notna()]

    print(f"Number of filtered elementary schools: {elementary_zones_filtered['DBN'].nunique()} (unique DBNs)")
    print(f"Number of filtered middle schools: {middle_zones_filtered['DBN'].nunique()} (unique DBNs)")

    # Find overlaps between elementary and middle/K-8 zones
    overlaps = []
    for _, elem_row in elementary_zones_filtered.iterrows():
        for _, middle_row in middle_zones_filtered.iterrows():
            if elem_row.geometry.intersects(middle_row.geometry):
                overlap_area = elem_row.geometry.intersection(middle_row.geometry).area
                if overlap_area > 0:
                    overlaps.append({
                        'Elementary_DBN': elem_row['DBN'],
                        'Middle_K8_DBN': middle_row['DBN'],
                        'Overlap_Area': overlap_area
                    })

    # Create DataFrame of overlaps and merge with school names
    if overlaps:
        overlaps_df = pd.DataFrame(overlaps)
        
        # Get detailed school information for overlapping pairs
        def get_detailed_school_info(dbn):
            school = simplified_df[simplified_df['ATS System Code'] == dbn].iloc[0]  # Use simplified_df instead of zoned_schools_df
            return {
                'School_Name': school['Location Name'],
                'School_Type': school['Location Category Description'],
                'Borough': school['Borough'],
                'Elementary_Rank': school['Elementary SchoolDigger Rank'],
                'Middle_Rank': school['Middle SchoolDigger Rank'],
                'Full_Address': school['Full Address']  # This will now be available
            }

        # Create a simplified overlaps DataFrame
        simplified_overlaps = []
        for _, row in overlaps_df.iterrows():
            elem_info = get_detailed_school_info(row['Elementary_DBN'])
            middle_info = get_detailed_school_info(row['Middle_K8_DBN'])
            
            # Convert ranks to numeric for averaging
            elem_rank = pd.to_numeric(elem_info['Elementary_Rank'], errors='coerce')
            middle_rank = pd.to_numeric(middle_info['Middle_Rank'], errors='coerce')
            
            # Calculate average rank (will be NaN if either rank is 'Not Ranked')
            avg_rank = (elem_rank + middle_rank) / 2 if not (pd.isna(elem_rank) or pd.isna(middle_rank)) else float('inf')
            
            simplified_overlaps.append({
                'Elementary_School': elem_info['School_Name'],
                'Elementary_Borough': elem_info['Borough'],
                'Elementary_SchoolDigger_Rank': elem_info['Elementary_Rank'],
                'Elementary_Total_Schools': total_elementary_schools_ranked,
                'Middle_School': middle_info['School_Name'],
                'Middle_Borough': middle_info['Borough'],
                'Middle_SchoolDigger_Rank': middle_info['Middle_Rank'],
                'Middle_Total_Schools': total_middle_schools_ranked,
                'Elementary_School_Type': elem_info['School_Type'],
                'Middle_School_Type': middle_info['School_Type'],
                'Elementary_Address': elem_info['Full_Address'],
                'Middle_Address': middle_info['Full_Address'],
                'Overlap_Area': row['Overlap_Area'],
                'Average_Rank': avg_rank
            })
        
        # Create and save simplified overlaps DataFrame
        simplified_overlaps_df = pd.DataFrame(simplified_overlaps)
        # Sort by Average_Rank (schools with no average rank will be at the end)
        simplified_overlaps_df = simplified_overlaps_df.sort_values('Average_Rank')
        # Drop the Average_Rank column before saving
        simplified_overlaps_df = simplified_overlaps_df.drop('Average_Rank', axis=1)
        simplified_overlaps_df = simplified_overlaps_df.drop_duplicates(subset=['Elementary_School', 'Middle_School'], keep='first')
        simplified_overlaps_df.to_csv('Elementary_Middle_School_Overlaps_Simplified.csv', index=False)
        print(f"Simplified overlaps data saved to Elementary_Middle_School_Overlaps_Simplified.csv")

        # Save overlaps to CSV
        # overlaps_df.to_csv('Elementary_Middle_School_Overlaps.csv', index=False)
        # print(f"\nOverlapping elementary and middle/K-8 schools saved to Elementary_Middle_School_Overlaps.csv")
        print(f"Found {len(overlaps_df)} overlapping pairs")
        print(f"Number of unique elementary schools involved: {overlaps_df['Elementary_DBN'].nunique()}")
        print(f"Number of unique middle/K-8 schools involved: {overlaps_df['Middle_K8_DBN'].nunique()}")
    else:
        print("\nNo overlapping zones found between elementary and middle/K-8 schools")

    # Save all dataframes to CSV files
    # lcgms_df.to_csv('LCGMS_SchoolData_with_Zones.csv', index=False)
    # zoned_schools_df.to_csv('LCGMS_SchoolData_Zoned_Only.csv', index=False)
    # elementary_sorted_df.to_csv('LCGMS_SchoolData_Simplified_Elementary.csv', index=False)
    # middle_sorted_df.to_csv('LCGMS_SchoolData_Simplified_Middle.csv', index=False)
    # print(f"\nFiles saved:")
    # print(f"All schools data saved to LCGMS_SchoolData_with_Zones.csv")
    # print(f"Zoned schools only data saved to LCGMS_SchoolData_Zoned_Only.csv")
    # print(f"Elementary SchoolDigger ranked data saved to LCGMS_SchoolData_Simplified_Elementary.csv")
    # print(f"Middle SchoolDigger ranked data saved to LCGMS_SchoolData_Simplified_Middle.csv")

if __name__ == "__main__":
    main()
