import json 
from svgpath2mpl import parse_path
import re
import numpy as np
import string
from shapely import MultiPolygon
import svgwrite

def extract_for_context(context):
    print(f"@ Extracting for {context}")
    file = f"./data/maps/raw/paths/philippines.{context}.json" 
    data = json.load(open(file, "r"))
    new_data = [] 
    n_items = len(data)
    i = 0 

    for data_item in data:
        print(f"\tProcessing {i + 1} of {n_items}")
        new_data_item = data_item 
        path = data_item["d"]
        polygons = [x.tolist() for x in parse_path(path).to_polygons()]
        new_data_item["polygons"] = polygons
        new_data.append(new_data_item)
        i += 1

    outfile = f"./data/maps/raw/polygons/philippines.{context}.json"
    json.dump(new_data, open(outfile, "w"), indent=4)

if __name__ == "__main__":
    extract_for_context("regions")
    extract_for_context("provinces")
    extract_for_context("municities")

