const cheerio = require("cheerio");
const fse = require("fs-extra")
const headerMap = require("_/scripts/helpers/headerMap.js")
const axios = require("axios")
const normalize = require("_/scripts/helpers/normalize")

module.exports = async function extractRegionsMetadata() {
    console.log("@ Extracting region metadata...")   
    const path = "./data/metadata/base/philippines.regions.html"
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
    $values.each((rowId, el) => {
        let $items = $(el).find("th, td") 
        let rowData = {} 

        // skip notes
        if($(el).attr("class") == "sortbottom") {
            return
        }

        rowData["id"] = rowId + 1

        $items.each((i, el) => {

            // extract values 
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
                rowData["region_name"] = normalize(name)
                rowData["region_link"] = normalize(link)
                rowData["region_id"] = normalize(abbr)
            }

            // process psgc 
            else if(i == _headerMap["psgc"]) {
                let psgc = $el.text().trim()
                rowData["psgc"] = parseInt(psgc)
            }

            // process island group 
            else if(i == _headerMap["island_group"]) {
                let islandGroup = $el.text().trim()
                rowData["island_group"] = normalize(islandGroup)
            }

            // process regional center 
            else if(i == _headerMap["regional_center"]) {
                let regionalCenter = $el.text().trim() 
                rowData["regional_center"] = normalize(regionalCenter)
            }

            // component local government units 
            else if(i == _headerMap["n_lgus"]) {
                let nLGUs = $el.find("div > div > div").text().trim()
                let $lgus = $el.find("ul > li"); 
                let lgus = []
                $lgus.each((i, el) => {
                    let lgu = $(el).text().trim() 
                    lgu = lgu.replaceAll(/\[.*\]/g, "")
                    lgus.push(normalize(lgu))
                })
                rowData["lgu_count"] = parseInt(nLGUs)
                rowData["lgus"] = lgus
            }

            // area 
            else if(i == _headerMap["area"]) {
                let area = $el.html().split("<sup>")[0]
                area = area.split("</span>")[1]
                area = area.replaceAll("&nbsp;km", "") 
                area = area.replaceAll(",", "")
                rowData["area_km2"] = parseFloat(area)
            }

            // population 
            else if(i == _headerMap["population"]) {
                let population = $el.html().split("<br>")[0]
                population = population.trim().replaceAll(",", "_")
                rowData["population"] = parseInt(population)
            }

            // density 
            else if(i == _headerMap["density"]) {
                let density = $el.html().split("<sup>")[0]
                density = density.split("</span>")[1]
                density = density.replaceAll("/km", "") 
                density = density.replaceAll(",", "")
                rowData["density_km2"] = parseFloat(density)
            }
 
        })

        rows.push(rowData)
    })
    

    // merge data
    const data = { headers, rows }

    console.log(`\tThe are ${rows.length} regions.`)

    // write data 
    const stringified = JSON.stringify(data, null, 4) 
    await fse.writeFile(
        "./data/metadata/part-a/philippines.regions.json",
        stringified
    )
    
}