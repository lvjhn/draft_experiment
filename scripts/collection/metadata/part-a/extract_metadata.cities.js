const cheerio = require("cheerio");
const fse = require("fs-extra")
const headerMap = require("_/scripts/helpers/headerMap.js")
const axios = require("axios")
const normalize = require("_/scripts/helpers/normalize")

module.exports = async function extractDistrictsMetadata() {
    console.log("@ Extracting cities metadata...")   
    const path = "./data/metadata/sources/philippines.cities.html"
    const html = (await fse.readFile(path)).toString()
    const $ = cheerio.load(html)
    
    const $table = $(
        "#mw-content-text > " + 
        "div.mw-content-ltr.mw-parser-output > " +
        "table.wikitable.sortable.sticky-header-multi.jquery-tablesorter"
    )

    // extract header names
    const headers = [
        "_",
        "city", 
        "population", 
        "area", 
        "density_2020", 
        "province", 
        "region", 
        "legal_class",
        "charter", 
        "approval", 
        "ratification"
    ] 

    const _headerMap = headerMap(headers)

    // extract data 
    const $values = $table.find("tbody > tr")
    const rows = []
    $values.each((rowId, el) => {
        let $items = $(el).find("th, td") 
        let rowData = {} 

        rowData["id"] = rowId

        // skip notes
        if($(el).attr("class") == "sortbottom") {
            return
        }


        $items.each((i, el) => {

            // extract values 
            let $el = $(el)
            
            // process location data 
            if(i == _headerMap["city"]) {
                let city = $el.text().trim() 
                let link = $el.find("a").attr("href")
                 
                rowData["city_name"] = normalize(city.trim())
                rowData["city_link"] = normalize(link)
            }

            // process population data 
            else if(i == _headerMap["population"]) {
                let population = $el.text().trim().replaceAll(",", "")
                population = population.replaceAll(/\[.*\]/g, "")
                rowData["population"] = parseInt(population)
            }

            // process area data 
            else if(i == _headerMap["area"]) {
                let area = $el.html().split("<sup>")[0]
                area = area.split("</span>")[1]
                area = area.replaceAll("&nbsp;km", "") 
                area = area.replaceAll(",", "")
                rowData["area_km2"] = parseFloat(area)
            }

            // process density data 
            else if(i == _headerMap["density_2020"]) {
                let density = $el.html().split("<sup>")[0]
                density = density.split("</span>")[1]
                density = density.replaceAll("&nbsp;km", "") 
                density = density.replaceAll(",", "")
                rowData["density_km2"] = parseFloat(density)
            }

            // process region data 
            else if(i == _headerMap["region"]) {
                let region = $el.text().trim()
                rowData["region"] = normalize(region)
            }

            // process legal class data 
            else if(i == _headerMap["legal_class"]) {
                let legal_class = $el.text().trim()
                rowData["legal_class"] = normalize(legal_class)
            }

            // process charter data 
            else if(i == _headerMap["charter"]) {
                let charter = $el.text().trim()
                charter = charter.replaceAll(/\[.*\]/g, "").trim()
                rowData["charter"] = normalize(charter)
            }

            // process approval data 
            else if(i == _headerMap["approval"]) {
                let approval = $el.text().trim()
                approval = approval.replaceAll(/\[.*\]/g, "").trim()
                rowData["approval"] = normalize(approval)
            }

            // process ratification data 
            else if(i == _headerMap["ratification"]) {
                let ratification = $el.text().trim()
                ratification = ratification.replaceAll(/\[.*\]/g, "").trim()
                rowData["ratification"] = normalize(ratification)
            }
            
        })

        rows.push(rowData)
    })
    

    // merge data
    const data = { headers, rows }

    console.log(`\tThere are ${rows.length} cities.`)

    // write data 
    const stringified = JSON.stringify(data, null, 4) 
    await fse.writeFile(
        "./data/metadata/part-a/philippines.cities.json",
        stringified
    )
    
}