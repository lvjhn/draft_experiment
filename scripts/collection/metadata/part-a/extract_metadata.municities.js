const cheerio = require("cheerio");
const fse = require("fs-extra")
const headerMap = require("_/scripts/helpers/headerMap.js")
const axios = require("axios")
const normalize = require("_/scripts/helpers/normalize")

module.exports = async function extractMunicipalityMetadata() {
    console.log("@ Extracting municity metadata...")   
    const path = "./data/metadata/base/philippines.municities.html"
    const html = (await fse.readFile(path)).toString()
    const $ = cheerio.load(html)
    
    const $table = $(
        "#mw-content-text > " + 
        "div.mw-content-ltr.mw-parser-output > " +
        "table.wikitable.mw-datatable.sortable.jquery-tablesorter"
    )

    // extract header names
    const headers = [
        "municity", 
        "population_2020", 
        "area_km2", 
        "population_density_2020", 
        "barangays", 
        "class", 
        "province"
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
            if(i == _headerMap["municity"]) {
                let municity = $el.text()
                let link = $el.find("a").attr("href")
                
               rowData["municity_name"] = normalize(municity.trim())
               rowData["municity_link"] = normalize(link)
            }

            // process population data 
            else if(i == _headerMap["population"]) {
                let population = $el.text()
                rowData["population"] = parseInt(population.trim())
            }

            // process area data
            else if(i == _headerMap["area"]) {
                let area = $el.text()
                rowData["area_km2"] = parseFloat(area.trim())
            }

            // process area data
            else if(i == _headerMap["population_density_2020"]) {
                let area = $el.text()
                rowData["population_density_2020"] = parseFloat(area.trim())
            }

            // process barangays data
            else if(i == _headerMap["barangays"]) {
                let barangays = $el.text()
                rowData["barangays"] = parseInt(barangays.trim())
            }

            // process class data
            else if(i == _headerMap["class"]) {
                let _class = $el.text()
                rowData["class"] = normalize(_class.trim())
            }

            // process province data
            else if(i == _headerMap["province"]) {
                let province = $el.text()
                rowData["province_name"] = province.trim()
            }
      
        })

        rows.push(rowData)
    })
    

    // merge data
    const data = { headers, rows }

    console.log(`\tThe are ${rows.length} municities.`)

    // write data 
    const stringified = JSON.stringify(data, null, 4) 
    await fse.writeFile(
        "./data/metadata/part-a/philippines.municities.json",
        stringified
    )
    
}