import json 
from svgpath2mpl import parse_path
import re
import numpy as np
import string
from shapely import MultiPolygon
import svgwrite

dw = svgwrite.Drawing(filename="out.svg", width="1920px", height="1080px")

def extract_for_context(context):
    print(f"@ Extracting for {context}")
    file = f"./data/maps/raw/paths/philippines.{context}.json" 
    data = json.load(open(file, "r"))
    n_items = len(data)
    i = 0 

    new_data = []

    for data_item in data:
        print(f"\tProcessing {i + 1} of {n_items}")
        new_data_item = data_item 
        path = data_item["d"]

        polygons = parse_path(path).to_polygons()
        for j in range(len(polygons)):
            polygons[j] = polygons[j].tolist()
            dw.add(dw.polygon(polygons[j], fill="blue"))
        
        new_data_item["polygons"] = polygons

        new_data.append(new_data_item)

        i += 1


    outfile = f"./data/maps/raw/polygons/svg/philippines.{context}.json"
    json.dump(new_data, open(outfile, "w"), indent=4)

if __name__ == "__main__":
    extract_for_context("regions")
    extract_for_context("provinces")
    extract_for_context("municities")

    dw.save()