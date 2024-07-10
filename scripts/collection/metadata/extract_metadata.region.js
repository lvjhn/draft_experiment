const cheerio = require("cheerio");
const fse = require("fs-extra")
const headerMap = require("_/scripts/helpers/headerMap.js")
const axios = require("axios")

module.exports = async function extractRegionsMetadata() {
    console.log("@ Extracting region metadata...")   
    const path = "./data/metadata/raw/philippines.regions.html"
    const html = (await fse.readFile(path)).toString()
    const $ = cheerio.load(html)
    
    const $table = $(
        "#mw-content-text > " + 
        "div.mw-content-ltr.mw-parser-output > " + 
        "table.wikitable.sortable.toptextcells.jquery-tablesorter"
    )

    // extract header names
    const headers = [
        "location",
        "region",
        "psgc", 
        "island_group", 
        "regional_center", 
        "n_lgus", 
        "area", 
        "population",
        "density"
    ] 

    const _headerMap = headerMap(headers)

    // extract data 
    const $values = $table.find("tbody > tr")
    const rows = []
    $values.each((i, el) => {
        let $items = $(el).find("th, td") 
        
        // skip notes
        if($(el).attr("class") == "sortbottom") {
            return
        }

        // extract values 
        const row = []
        $items.each((i, el) => {
            let rowData = {} 
            let $el = $(el)
            
            // process location data 
            if(i == _headerMap["location"]) {
                rowData["location"] = "N/A"
            }

            // process name data
            else if(i == _headerMap["region"]) {
                let name = $el.find("a").text().replaceAll(/\[.*\]/g, "")
                let link = $el.find("a").attr("href")
                let abbr = $el.find("span").text().slice(1, -1)
                rowData["region_name"] = name 
                rowData["region_link"] = link 
                rowData["region_id"] = abbr
            }

            // process psgc 
            else if(i == _headerMap["psgc"]) {
                let psgc = $el.text().trim()
                rowData["psgc"] = psgc
            }

            // process island group 
            else if(i == _headerMap["island_group"]) {
                let islandGroup = $el.text().trim()
                rowData["island_group"] = islandGroup
            }

            // process regional center 
            else if(i == _headerMap["regional_center"]) {
                let regionalCenter = $el.text().trim() 
                rowData["regional_center"] = regionalCenter
            }

            // component local government units 
            else if(i == _headerMap["n_lgus"]) {
                let nLGUs = $el.find("div > div > div").text().trim()
                let $lgus = $el.find("ul > li"); 
                let lgus = []
                $lgus.each((i, el) => {
                    let lgu = $(el).text().trim() 
                    lgu = lgu.replaceAll(/\[.*\]/g, "")
                    lgus.push(lgu)
                })
                rowData["lgu_count"] = nLGUs 
                rowData["lgus"] = lgus
            }

            // area 
            else if(i == _headerMap["area"]) {
                let area = $el.html().split("<sup>")[0]
                area = area.split("</span>")[1]
                area = area.replaceAll("&nbsp;km", "") 
                area = area.replaceAll(",", "_")
                rowData["area_km2"] = area
            }

            // population 
            else if(i == _headerMap["population"]) {
                let population = $el.html().split("<br>")[0]
                population = population.trim().replaceAll(",", "_")
                rowData["population"] = population
            }

            // density 
            else if(i == _headerMap["density"]) {
                let density = $el.html().split("<sup>")[0]
                density = density.split("</span>")[1]
                density = density.replaceAll("/km", "") 
                density = density.replaceAll(",", "_")
                rowData["density_km2"] = density
            }
 
            row.push(rowData)
        })

        rows.push(row)
    })

    console.log(rows)
}