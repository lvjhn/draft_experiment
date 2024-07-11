import json
import re
import shapely 
import numpy as np
import geopandas as gpd
import svgwrite 
from shapely.validation import make_valid

dw = svgwrite.Drawing(filename="output.svg", width="1080px", height="1920px")

def extract_district_shapes():
    # define paths to file
    municities_map_file = \
        "./data/maps/raw/polygons/svg/philippines.municities.json"
    municities_file = \
        "./data/metadata/part-a/philippines.municities.json"
    
    # open files
    municities = json.load(open(municities_file, "r"))
    municities_map  = json.load(open(municities_map_file, "r"))

    # map cities to districts
    districts = {}
    d_ids = set()
    for municity in municities_map: 
        data = municity 
        tokens = data["id"].split("+")
        
        province_name_ = tokens[0] 
        municity_name_ = tokens[1]





if __name__ == "__main__":
    extract_district_shapes()

