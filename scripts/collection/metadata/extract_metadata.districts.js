const cheerio = require("cheerio");
const fse = require("fs-extra")
const headerMap = require("_/scripts/helpers/headerMap.js")
const axios = require("axios")

module.exports = async function extractDistrictsMetadata() {
    console.log("@ Extracting district metadata...")   
    const path = "./data/metadata/base/philippines.districts.html"
    const html = (await fse.readFile(path)).toString()
    const $ = cheerio.load(html)
    
    const $table = $(
        "#mw-content-text > " + 
        "div.mw-content-ltr.mw-parser-output > " +
        "table.wikitable.mw-datatable.sortable.jquery-tablesorter"
    )

    // extract header names
    const headers = [
        "district", 
        "region", 
        "electorate", 
        "population", 
        "area", 
        "representative", 
        "",
        "party"
    ] 

    const _headerMap = headerMap(headers)

    // extract data 
    const $values = $table.find("tbody > tr")
    const rows = []
    $values.each((i, el) => {
        let $items = $(el).find("th, td") 
        let rowData = {} 

        // skip notes
        if($(el).attr("class") == "sortbottom") {
            return
        }
        $items.each((i, el) => {

            // extract values 
            let $el = $(el)
            
            // process location data 
            if(i == _headerMap["district"]) {
                let name = $el.text()
                let link = $el.find("a").attr("href")

                if(name.indexOf("'s ") != -1) {
                    name = name.split("'s ")    
                }

                else if(name.indexOf("' ") != -1) {
                    name = name.split("' ")    
                }
                
                else {
                    name = name.split(" ") 
                    name[0] = name.slice(1, -1) 
                    name[1] = name.at(-1)
                }

                
               let province = name[0] 
               let district = name[1]
              
               district = district.replaceAll("st", "")
               district = district.replaceAll("nd", "")
               district = district.replaceAll("rd", "")
               district = district.replaceAll("th", "")
                
               rowData["province"] = province.trim()
               rowData["district"] = district.trim()
               rowData["link"] = link
            }
            
            // process region 
            else if(i == _headerMap["region"]) {
                let region = $el.text().trim()
                rowData["region"] = region 
            }

            // process electorate 
            else if(i == _headerMap["electorate"]) {
                let electorate = $el.text().trim().replaceAll(",", "")
                rowData["electorate"] = parseInt(electorate)
            }

            // process population 
            else if(i == _headerMap["population"]) {
                let population = $el.text().trim().replaceAll(",", "")
                rowData["population"] = parseInt(population)
            }

            // process area 
            else if(i == _headerMap["area"]) {
                let area = $el.text().trim().replaceAll(",", "")
                rowData["area_km2"] = parseInt(area)
            }

            // process representative 
            else if(i == _headerMap["representative"]) {
                let representative = $el.text().trim()
                rowData["representative"] = representative
            }

            // process party 
            else if(i == _headerMap["party"]) {
                let party = $el.text().trim()
                rowData["party"] = party
            }
            
        })

        rows.push(rowData)
    })
    

    // merge data
    const data = { headers, rows }

    // write data 
    const stringified = JSON.stringify(data, null, 4) 
    await fse.writeFile(
        "./data/metadata/part-a/philippines.districts.json",
        stringified
    )
    
}