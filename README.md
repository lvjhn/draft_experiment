
# Data Collection Protocol 

## General Statistics (July 2024)
* **No. of Regions** - 17 
* **No. of Provinces** - 82 
* **No. of Districts** - 253 
* **No. of Cities** - 149  
* **No. of Municipalities** - 1,494 
* **No. of Barangays** - 42,029 

## Data / Datasets 
1. **Philippine SVG Maps** 
    * **Nation Level** - no borders (plain map) 
        - **Source**: https://simplemaps.com/svg/country/ph
        - **License**: Free to Use for Commercial and Personal Use 
        - **Size** : 56.6 KiB
    * **Region Level** - region-level borders
        - **Source**: https://commons.wikimedia.org/wiki/File:Blank_map_of_the_Philippines_%28Regions%29.svg
        - **License**: Creative Commons Attribution-Share Alike 4.0 International 
        - **Size** : 10.5 MiB
    * **Province Level** - province-level borders
        - **Source**: https://mapsvg.com/maps/philippines
        - **License**: https://creativecommons.org/licenses/by/4.0/
        - **Size** : 97.6 KiB
    * **District Level** - district-level borders
        - Derived from Municipality/City Level
    * **Municipality/City Level** - municipality/city-level borders
        - **Source**: https://commons.wikimedia.org/wiki/File:Municipalities_of_the_Philippines.svg
        - **License**: Public Domain
        - **Size**: 47.3 MiB
    * **Barangay Level** - barangay-level borders
        - **Not Included** - Future Recommendation 

1. **List/Outline of Barangays (2016, 2017, and 2019)** 
    * **Source**: https://github.com/flores-jacob/philippine-regions-provinces-cities-municipalities-barangays
    * **License**: MIT

1. **Metadata (Part A) Arti     cles** 
    - These articles are used to find locations and relevant information or
      articles about them. 
    - Involved Articles : 
        - **Regions of the Philippines** 
            - https://en.wikipedia.org/wiki/Regions_of_the_Philippines
        - **Provinces of the Philippines** 
            - https://en.wikipedia.org/wiki/Provinces_of_the_Philippines
        - **Congressional Districts of the Philippines** 
            - https://en.wikipedia.org/wiki/Congressional_districts_of_the_Philippines
        - **List of Municipalities/Cities in the Philippines** 
            - https://en.wikipedia.org/wiki/List_of_cities_and_municipalities_in_the_Philippines





## Installation 
1. (Optional) Copy the Involved Articles (if updated) Metadata articles in 
   Part-A in `./data/metadata/base` folder with the following names respectively:
    - `philippines.regions.html` 
    - `philippines.provinces.html` 
    - `philippines.district.html`
    - `philippines.cities.html`
    - `philippines.municiites.html`

1. Run `node scripts/metadata/part-a/extract_metadata.js`. 
   Then, verify the outputs at `./data/metadata/part-a/` folder. 


1. Then, `node scripts/collection/articles/scraper.js`. 
   Verify the outputs at `./data/articles/` folder. 

