const cheerio = require("cheerio");
const fse = require("fs-extra")
const headerMap = require("_/scripts/helpers/headerMap.js")
const axios = require("axios")
const normalize = require("_/scripts/helpers/normalize")

module.exports = async function extractProvincesMetadata() {
    console.log("@ Extracting province metadata...")   

    const path = "./data/metadata/base/philippines.provinces.html"
    const html = (await fse.readFile(path)).toString()
    const $ = cheerio.load(html)
    
    const $table = $(
        "#mw-content-text > " + 
        "div.mw-content-ltr.mw-parser-output > " + 
        "table.wikitable.sortable.toptextcells.jquery-tablesorter"
    )

   
    const headers = [
        "iso",
        "province",
        "capital", 
        "population_perc", 
        "population_2020", 
        "area", 
        "density", 
        "founded",
        "island_group",
        "region", 
        "total_municipalities", 
        "total_cities", 
        "total_barangays"
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

        rowData["id"] = rowId

        $items.each((i, el) => {

            // extract values 
            let $el = $(el)
            
            // process location data 
            if(i == _headerMap["iso"]) {
                let iso = $el.text().trim() 
                rowData["iso"] = iso
            }

            // process name data 
            else if(i == _headerMap["province"]) {
                let name = $el.find("a").text().replaceAll(/\[.*\]/g, "")
                let link = $el.find("a").attr("href")
                rowData["province_name"] = normalize(name) 
                rowData["province_link"] = normalize(link) 
            }

            // capital
            else if(i == _headerMap["capital"]) {
                let capital = $el.text().trim()
                rowData["capital"] = normalize(capital)
            }

            // population %
            else if(i == _headerMap["population_perc"]) {
                let population_perc = $el.text().trim().replaceAll("%", "")
                rowData["population_perc"] = parseFloat(population_perc)
            }

            // population 2020
            else if(i == _headerMap["population_2020"]) {
                let population_perc = $el.text().trim().replaceAll(",", "_")
                rowData["population_2020"] = parseInt(population_perc)
            }

            // area 
            else if(i == _headerMap["area"]) {
                let area = $el.html().split("<sup>")[0]
                area = area.split("</span>")[1]
                area = area.replaceAll("&nbsp;km", "") 
                area = area.replaceAll(",", "")
                rowData["area_km2"] = parseFloat(area)
            }

            // density 
            else if(i == _headerMap["density"]) {
                let density = $el.html().split("<sup>")[0]
                density = density.split("</span>")[1]
                density = density.replaceAll("&nbsp;km", "") 
                density = density.replaceAll(",", "")
                rowData["density_km2"] = parseFloat(density)
            }

            // founded 
            else if(i == _headerMap["founded"]) {
                let founded = $el.text().trim()
                rowData["founded"] = parseFloat(founded)
            }

            // island group 
            else if(i == _headerMap["island_group"]) {
                let islandGroup = $el.text().trim()
                rowData["island_group"] = normalize(islandGroup)
            }

            // region
            else if(i == _headerMap["region"]) {
                let region = $el.text().trim()
                rowData["region"] = normalize(region)
            }

            // total municipalities
            else if(i == _headerMap["total_municipalities"]) {
                let count = $el.text().trim()
                rowData["total_municipalitites"] = parseInt(count)
            }

            // total cities
            else if(i == _headerMap["total_cities"]) {
                let count = $el.text().trim()
                rowData["total_cities"] = parseInt(count)
            }

            // total barangays
            else if(i == _headerMap["total_barangays"]) {
                let count = $el.text().trim()
                rowData["total_barangays"] = parseInt(count)
            }
        })

        rows.push(rowData)
    })
    

    // merge data
    const data = { headers, rows }

    console.log(`\tThere are ${rows.length} provinces.`)

    // write data 
    const stringified = JSON.stringify(data, null, 4) 
    await fse.writeFile(
        "./data/metadata/part-a/philippines.provinces.json",
        stringified
    )
    
}